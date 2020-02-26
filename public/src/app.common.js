require('bootstrap');

window.$ = require('jquery');
window.jQuery = window.$;
window.bootbox = require('bootbox');
require('jquery-form');
window.utils = require('./utils');

const Visibility = require('visibilityjs');
const Benchpress = require('benchpressjs');
Benchpress.setGlobal('config', config);

const translator = require('./modules/translator');

// temp for testing
require('jquery-ui/ui/widgets/datepicker');
$('#inputBirthday').datepicker({
	changeMonth: true,
	changeYear: true,
	yearRange: '1900:-5y',
	defaultDate: '-13y',
});

require('./sockets');
require('./overrides');
require('./ajaxify');

app = window.app || {};

app.isFocused = true;
app.currentRoom = null;
app.widgets = {};
app.cacheBuster = config['cache-buster'];

window.addEventListener('DOMContentLoaded', function () {
	ajaxify.init();
	app.load();
});

(function () {
	var params = utils.params();
	var showWelcomeMessage = !!params.loggedin;
	var registerMessage = params.register;
	var isTouchDevice = utils.isTouchDevice();

	bootbox.setDefaults({
		locale: config.userLang,
	});

	app.load = function () {
		translator.prepareDOM();

		app.loadProgressiveStylesheet();

		overrides.overrideTimeago();

		var url = ajaxify.start(window.location.pathname.slice(1) + window.location.search + window.location.hash);
		ajaxify.updateHistory(url, true);
		ajaxify.parseData();
		ajaxify.end(url, app.template);

		handleStatusChange();

		if (config.searchEnabled) {
			app.handleSearch();
		}

		$('body').on('click', '#new_topic', function (e) {
			e.preventDefault();
			app.newTopic();
		});

		$('#header-menu .container').on('click', '[component="user/logout"]', app.logout);

		Visibility.change(function (event, state) {
			if (state === 'visible') {
				app.isFocused = true;
			} else if (state === 'hidden') {
				app.isFocused = false;
			}
		});

		createHeaderTooltips();
		app.showEmailConfirmWarning();
		app.showCookieWarning();

		socket.removeAllListeners('event:nodebb.ready');
		socket.on('event:nodebb.ready', function (data) {
			if ((data.hostname === app.upstreamHost) && (!app.cacheBuster || app.cacheBuster !== data['cache-buster'])) {
				app.cacheBuster = data['cache-buster'];

				app.alert({
					alert_id: 'forum_updated',
					title: '[[global:updated.title]]',
					message: '[[global:updated.message]]',
					clickfn: function () {
						window.location.reload();
					},
					type: 'warning',
				});
			}
		});
		socket.on('event:livereload', function () {
			if (app.user.isAdmin && !ajaxify.currentPage.match(/admin/)) {
				window.location.reload();
			}
		});

		require(['helpers', 'forum/pagination'], function (helpers, pagination) {
			helpers.register();

			pagination.init();

			$(window).trigger('action:app.load');
		});
	};

	app.logout = function () {
		$(window).trigger('action:app.logout');

		/*
			Set session refresh flag (otherwise the session check will trip and throw invalid session modal)
			We know the session is/will be invalid (uid mismatch) because the user is logging out
		*/
		app.flags = app.flags || {};
		app.flags._sessionRefresh = true;

		$.ajax(config.relative_path + '/logout', {
			type: 'POST',
			headers: {
				'x-csrf-token': config.csrf_token,
			},
			success: function (data) {
				$(window).trigger('action:app.loggedOut', data);
				if (data.next) {
					window.location.href = data.next;
				} else {
					window.location.reload();
				}
			},
		});
		return false;
	};

	app.alert = function (params) {
		require(['alerts'], function (alerts) {
			alerts.alert(params);
		});
	};

	app.removeAlert = function (id) {
		require(['alerts'], function (alerts) {
			alerts.remove(id);
		});
	};

	app.alertSuccess = function (message, timeout) {
		app.alert({
			title: '[[global:alert.success]]',
			message: message,
			type: 'success',
			timeout: timeout || 5000,
		});
	};

	app.alertError = function (message, timeout) {
		message = message.message || message;

		if (message === '[[error:invalid-session]]') {
			return app.handleInvalidSession();
		}

		app.alert({
			title: '[[global:alert.error]]',
			message: message,
			type: 'danger',
			timeout: timeout || 10000,
		});
	};

	app.handleInvalidSession = function () {
		if (app.flags && app.flags._sessionRefresh) {
			return;
		}

		app.flags = app.flags || {};
		app.flags._sessionRefresh = true;

		socket.disconnect();

		bootbox.alert({
			title: '[[error:invalid-session]]',
			message: '[[error:invalid-session-text]]',
			closeButton: false,
			callback: function () {
				window.location.reload();
			},
		});
	};

	app.enterRoom = function (room, callback) {
		callback = callback || function () {};
		if (socket && app.user.uid && app.currentRoom !== room) {
			var previousRoom = app.currentRoom;
			app.currentRoom = room;
			socket.emit('meta.rooms.enter', {
				enter: room,
			}, function (err) {
				if (err) {
					app.currentRoom = previousRoom;
					return app.alertError(err.message);
				}

				callback();
			});
		}
	};

	app.leaveCurrentRoom = function () {
		if (!socket) {
			return;
		}
		var previousRoom = app.currentRoom;
		app.currentRoom = '';
		socket.emit('meta.rooms.leaveCurrent', function (err) {
			if (err) {
				app.currentRoom = previousRoom;
				return app.alertError(err.message);
			}
		});
	};

	function highlightNavigationLink() {
		$('#main-nav li')
			.removeClass('active')
			.find('a')
			.filter(function (i, x) { return window.location.pathname.startsWith(x.getAttribute('href')); })
			.parent()
			.addClass('active');
	}

	app.createUserTooltips = function (els, placement) {
		if (isTouchDevice) {
			return;
		}
		els = els || $('body');
		els.find('.avatar,img[title].teaser-pic,img[title].user-img,div.user-icon,span.user-icon').each(function () {
			var title = $(this).attr('title');
			if (title) {
				$(this).tooltip({
					placement: placement || $(this).attr('title-placement') || 'top',
					title: title,
				});
			}
		});
	};

	app.createStatusTooltips = function () {
		if (!isTouchDevice) {
			$('body').tooltip({
				selector: '.fa-circle.status',
				placement: 'top',
			});
		}
	};

	app.processPage = function () {
		highlightNavigationLink();

		$('.timeago').timeago();

		utils.makeNumbersHumanReadable($('.human-readable-number'));

		utils.addCommasToNumbers($('.formatted-number'));

		app.createUserTooltips();

		app.createStatusTooltips();

		// Scroll back to top of page
		if (!ajaxify.isCold()) {
			window.scrollTo(0, 0);
		}
	};

	app.showMessages = function () {
		var messages = {
			login: {
				format: 'alert',
				title: '[[global:welcome_back]] ' + app.user.username + '!',
				message: '[[global:you_have_successfully_logged_in]]',
			},
			register: {
				format: 'modal',
			},
		};

		function showAlert(type, message) {
			switch (messages[type].format) {
			case 'alert':
				app.alert({
					type: 'success',
					title: messages[type].title,
					message: messages[type].message,
					timeout: 5000,
				});
				break;

			case 'modal':
				bootbox.alert({
					title: messages[type].title,
					message: message || messages[type].message,
				});
				break;
			}
		}

		if (showWelcomeMessage) {
			showWelcomeMessage = false;
			$(document).ready(function () {
				showAlert('login');
			});
		}
		if (registerMessage) {
			$(document).ready(function () {
				showAlert('register', utils.escapeHTML(decodeURIComponent(registerMessage)));
				registerMessage = false;
			});
		}
	};

	app.openChat = function (roomId) {
		if (!app.user.uid) {
			return app.alertError('[[error:not-logged-in]]');
		}
		ajaxify.go('chats/' + roomId);
	};

	app.newChat = function (touid, callback) {
		function createChat() {
			socket.emit('modules.chats.newRoom', { touid: touid }, function (err, roomId) {
				if (err) {
					return app.alertError(err.message);
				}

				if (!ajaxify.data.template.chats) {
					app.openChat(roomId);
				} else {
					ajaxify.go('chats/' + roomId);
				}

				callback(false, roomId);
			});
		}

		callback = callback || function () {};
		if (!app.user.uid) {
			return app.alertError('[[error:not-logged-in]]');
		}

		if (parseInt(touid, 10) === parseInt(app.user.uid, 10)) {
			return app.alertError('[[error:cant-chat-with-yourself]]');
		}
		socket.emit('modules.chats.isDnD', touid, function (err, isDnD) {
			if (err) {
				return app.alertError(err.message);
			}
			if (!isDnD) {
				return createChat();
			}
			bootbox.confirm('[[modules:chat.confirm-chat-with-dnd-user]]', function (ok) {
				if (ok) {
					createChat();
				}
			});
		});
	};

	app.toggleNavbar = function (state) {
		var navbarEl = $('.navbar');
		if (navbarEl) {
			navbarEl.toggleClass('hidden', !state);
		}
	};

	function createHeaderTooltips() {
		var env = utils.findBootstrapEnvironment();
		if (env === 'xs' || env === 'sm' || isTouchDevice) {
			return;
		}
		$('#header-menu li a[title]').each(function () {
			$(this).tooltip({
				placement: 'bottom',
				trigger: 'hover',
				title: $(this).attr('title'),
			});
		});


		$('#search-form').parent().tooltip({
			placement: 'bottom',
			trigger: 'hover',
			title: $('#search-button i').attr('title'),
		});


		$('#user_dropdown').tooltip({
			placement: 'bottom',
			trigger: 'hover',
			title: $('#user_dropdown').attr('title'),
		});
	}

	app.enableTopicSearch = function (options) {
		var quickSearchResults = options.resultEl;
		var inputEl = options.inputEl;
		var template = options.template || 'partials/quick-search-results';
		var searchTimeoutId = 0;
		inputEl.on('keyup', function () {
			if (searchTimeoutId) {
				clearTimeout(searchTimeoutId);
				searchTimeoutId = 0;
			}
			if (inputEl.val().length < 3) {
				return;
			}

			searchTimeoutId = setTimeout(function () {
				if (!inputEl.is(':focus')) {
					return quickSearchResults.addClass('hidden');
				}
				require(['search'], function (search) {
					var data = {
						term: inputEl.val(),
						in: 'titles',
						searchOnly: 1,
					};
					$(window).trigger('action:search.quick', { data: data });
					search.api(data, function (data) {
						if (!data.matchCount) {
							quickSearchResults.html('').addClass('hidden');
							return;
						}
						data.posts.forEach(function (p) {
							p.snippet = utils.escapeHTML($(p.content).text().slice(0, 80) + '...');
						});
						app.parseAndTranslate(template, data, function (html) {
							html.find('.timeago').timeago();
							quickSearchResults.html(html).removeClass('hidden').show();
						});
					});
				});
			}, 250);
		});
	};

	app.handleSearch = function () {
		var searchButton = $('#search-button');
		var searchFields = $('#search-fields');
		var searchInput = $('#search-fields input');
		var quickSearchResults = $('#quick-search-results');

		$('#search-form .advanced-search-link').on('mousedown', function () {
			ajaxify.go('/search');
		});

		$('#search-form').on('submit', function () {
			searchInput.blur();
		});
		searchInput.on('blur', dismissSearch);
		searchInput.on('focus', function () {
			if (searchInput.val() && quickSearchResults.children().length) {
				quickSearchResults.removeClass('hidden').show();
			}
		});

		app.enableTopicSearch({
			inputEl: searchInput,
			resultEl: quickSearchResults,
		});

		function dismissSearch() {
			searchFields.addClass('hidden');
			searchButton.removeClass('hidden');
			setTimeout(function () {
				quickSearchResults.addClass('hidden');
			}, 200);
		}

		searchButton.on('click', function (e) {
			if (!config.loggedIn && !app.user.privileges['search:content']) {
				app.alert({
					message: '[[error:search-requires-login]]',
					timeout: 3000,
				});
				ajaxify.go('login');
				return false;
			}
			e.stopPropagation();

			app.prepareSearch();
			return false;
		});

		$('#search-form').on('submit', function () {
			var input = $(this).find('input');
			require(['search'], function (search) {
				var data = search.getSearchPreferences();
				data.term = input.val();
				$(window).trigger('action:search.submit', { data: data });
				search.query(data, function () {
					input.val('');
				});
			});
			return false;
		});
	};

	app.prepareSearch = function () {
		$('#search-fields').removeClass('hidden');
		$('#search-button').addClass('hidden');
		$('#search-fields input').focus();
	};

	function handleStatusChange() {
		$('[component="header/usercontrol"] [data-status]').off('click').on('click', function (e) {
			var status = $(this).attr('data-status');
			socket.emit('user.setStatus', status, function (err) {
				if (err) {
					return app.alertError(err.message);
				}
				$('[data-uid="' + app.user.uid + '"] [component="user/status"], [component="header/profilelink"] [component="user/status"]')
					.removeClass('away online dnd offline')
					.addClass(status);
				$('[component="header/usercontrol"] [data-status]').each(function () {
					$(this).find('span').toggleClass('bold', $(this).attr('data-status') === status);
				});
				app.user.status = status;
			});
			e.preventDefault();
		});
	}

	app.updateUserStatus = function (el, status) {
		if (!el.length) {
			return;
		}

		translator.translate('[[global:' + status + ']]', function (translated) {
			el.removeClass('online offline dnd away')
				.addClass(status)
				.attr('title', translated)
				.attr('data-original-title', translated);
		});
	};

	app.newTopic = function (cid, tags) {
		$(window).trigger('action:composer.topic.new', {
			cid: cid || ajaxify.data.cid || 0,
			tags: tags || (ajaxify.data.tag ? [ajaxify.data.tag] : []),
		});
	};

	app.showEmailConfirmWarning = function (err) {
		if (!config.requireEmailConfirmation || !app.user.uid) {
			return;
		}
		var msg = {
			alert_id: 'email_confirm',
			type: 'warning',
			timeout: 0,
		};

		if (!app.user.email) {
			msg.message = '[[error:no-email-to-confirm]]';
			msg.clickfn = function () {
				app.removeAlert('email_confirm');
				ajaxify.go('user/' + app.user.userslug + '/edit');
			};
			app.alert(msg);
		} else if (!app.user['email:confirmed'] && !app.user.isEmailConfirmSent) {
			msg.message = err ? err.message : '[[error:email-not-confirmed]]';
			msg.clickfn = function () {
				app.removeAlert('email_confirm');
				socket.emit('user.emailConfirm', {}, function (err) {
					if (err) {
						return app.alertError(err.message);
					}
					app.alertSuccess('[[notifications:email-confirm-sent]]');
				});
			};

			app.alert(msg);
		} else if (!app.user['email:confirmed'] && app.user.isEmailConfirmSent) {
			msg.message = '[[error:email-not-confirmed-email-sent]]';
			app.alert(msg);
		}
	};

	app.parseAndTranslate = function (template, blockName, data, callback) {
		var args = [template];
		if (blockName === 'string') {
			args.push(blockName);
		} else {
			callback = data;
			data = blockName;
		}
		args.push(data);
		args.push(function (html) {
			translator.translate(html, function (translatedHTML) {
				callback($(translator.unescape(translatedHTML)));
			});
		});
		console.log(args);
		Benchpress.parse.apply(Benchpress, args);
	};

	app.loadProgressiveStylesheet = function () {
		var linkEl = document.createElement('link');
		linkEl.rel = 'stylesheet';
		linkEl.href = config.relative_path + '/assets/js-enabled.css?' + app.cacheBuster;

		document.head.appendChild(linkEl);
	};

	app.showCookieWarning = function () {
		require(['storage'], function (storage) {
			if (!config.cookies.enabled || !navigator.cookieEnabled) {
				// Skip warning if cookie consent subsystem disabled (obviously), or cookies not in use
				return;
			} else if (window.location.pathname.startsWith(config.relative_path + '/admin')) {
				// No need to show cookie consent warning in ACP
				return;
			} else if (storage.getItem('cookieconsent') === '1') {
				return;
			}

			config.cookies.message = translator.unescape(config.cookies.message);
			config.cookies.dismiss = translator.unescape(config.cookies.dismiss);
			config.cookies.link = translator.unescape(config.cookies.link);
			config.cookies.link_url = translator.unescape(config.cookies.link_url);

			app.parseAndTranslate('partials/cookie-consent', config.cookies, function (html) {
				$(document.body).append(html);
				$(document.body).addClass('cookie-consent-open');

				var warningEl = $('.cookie-consent');
				var dismissEl = warningEl.find('button');
				dismissEl.on('click', function () {
					// Save consent cookie and remove warning element
					storage.setItem('cookieconsent', '1');
					warningEl.remove();
					$(document.body).removeClass('cookie-consent-open');
				});
			});
		});
	};
}());
