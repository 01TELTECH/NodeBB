<!-- IMPORT admin/partials/settings/header.tpl -->

<form role="form" data-settings="core.settings.general">
	<div class="row mb-4">
		<div class="col-12 col-sm-2 settings-header">
			[[admin/settings/general:site-settings]]
		</div>
		<div class="col-12 col-sm-10">
			<div class="form-group">
				<label for="title">[[admin/settings/general:title]]</label>
				<input id="title" name="title" class="form-control" type="text" placeholder="[[admin/settings/general:title.name]]" />
			</div>

			<div class="form-group">
				<label for="title:url">[[admin/settings/general:title.url]]</label>
				<input id="title:url" name="title:url" type="text" class="form-control" placeholder="[[admin/settings/general:title.url-placeholder]]" />
				<small class="form-text text-muted">
					[[admin/settings/general:title.url-help]]
				</small>
			</div>

			<div class="form-group form-check">
				<input type="checkbox" class="form-check-input" id="showSiteTitle" name="showSiteTitle">
				<label class="form-check-label" for="showSiteTitle">[[admin/settings/general:title.show-in-header]]</label>
			</div>

			<div class="form-group">
				<label for="browserTitle">[[admin/settings/general:browser-title]]</label>
				<input id="browserTitle" name="browserTitle" type="text" class="form-control" placeholder="[[admin/settings/general:browser-title]]" />
				<small class="form-text text-muted">
					[[admin/settings/general:browser-title-help]]
				</small>
			</div>

			<div class="form-group">
				<label for="titleLayout">[[admin/settings/general:title-layout]]</label>
				<input id="titleLayout" name="titleLayout" type="text" class="form-control" placeholder="[[admin/settings/general:title-layout]]" />
				<small class="form-text text-muted">
					[[admin/settings/general:title-layout-help]]
				</small>
			</div>

			<div class="form-group">
				<label for="description">[[admin/settings/general:description]]</label>
				<input id="description" name="description" type="text" class="form-control" placeholder="[[admin/settings/general:description.placeholder]]" />
			</div>

			<div class="form-group">
				<label for="keywords">[[admin/settings/general:keywords]]</label><br />
				<input id="keywords" name="keywords" type="text" class="form-control" placeholder="[[admin/settings/general:keywords-placeholder]]" data-field-type="tagsinput" /><br />
			</div>
		</div>
	</div>

	<div class="row mb-4">
		<div class="col-12 col-sm-2 settings-header">[[admin/settings/general:logo]]</div>
		<div class="col-12 col-sm-10">
			<div class="form-group">
				<label for="logoUrl">[[admin/settings/general:logo.image]]</label>
				<div class="input-group">
					<input id="logoUrl" name="logoUrl" type="text" class="form-control" placeholder="[[admin/settings/general:logo.image-placeholder]]" />
					<div class="input-group-append">
						<input data-action="upload" data-target="logoUrl" data-route="{config.relative_path}/api/admin/uploadlogo" type="button" class="btn btn-primary" value="[[admin/settings/general:logo.upload]]"></input>
						<button data-action="removeLogo" type="button" class="btn btn-danger"><i class="fa fa-times"></i></button>
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="brand:logo:url">[[admin/settings/general:logo.url]]</label>
				<input id="brand:logo:url" name="brand:logo:url" type="text" class="form-control" placeholder="[[admin/settings/general:logo.url-placeholder]]" />
				<small class="form-text text-muted">[[admin/settings/general:logo.url-help]]</small>
			</div>
			<div class="form-group">
				<label for="brand:logo:alt">[[admin/settings/general:logo.alt-text]]</label>
				<input id="brand:logo:alt" name="brand:logo:alt" type="text" class="form-control" placeholder="[[admin/settings/general:log.alt-text-placeholder]]" />
			</div>

			<div class="form-group">
				<label for="og_image">og:image</label>
				<div class="input-group">
					<input id="og_image" name="og_image" type="text" class="form-control" placeholder="" />
					<div class="input-group-append">
						<input data-action="upload" data-target="og_image" data-route="{config.relative_path}/api/admin/uploadOgImage" type="button" class="btn btn-primary" value="[[admin/settings/general:logo.upload]]"></input>
						<button data-action="removeOgImage" type="button" class="btn btn-danger"><i class="fa fa-times"></i></button>
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="faviconUrl">favicon</label>
				<div class="input-group">
					<input id="faviconUrl" name="faviconUrl" type="text" class="form-control" placeholder="favicon.ico" data-action="upload" data-target="faviconUrl" data-route="{config.relative_path}/api/admin/uploadfavicon" readonly />
					<div class="input-group-append">
						<input data-action="upload" data-target="faviconUrl" data-route="{config.relative_path}/api/admin/uploadfavicon" data-help="0" type="button" class="btn btn-primary" value="[[admin/settings/general:favicon.upload]]"></input>
						<button data-action="removeFavicon" type="button" class="btn btn-danger"><i class="fa fa-times"></i></button>
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="touchIconUrl">Touch Icon</label>
				<div class="input-group">
					<input id="touchIconUrl" name="touchIconUrl" type="text" class="form-control" data-action="upload" data-target="touchIconUrl" data-route="{config.relative_path}/api/admin/uploadTouchIcon" readonly />
					<div class="input-group-append">
						<input data-action="upload" data-target="touchIconUrl" data-route="{config.relative_path}/api/admin/uploadTouchIcon" type="button" class="btn btn-primary" value="[[admin/settings/general:touch-icon.upload]]"></input>
						<button data-action="removeTouchIcon" type="button" class="btn btn-danger"><i class="fa fa-times"></i></button>
					</div>
				</div>
				<small class="form-text text-muted">[[admin/settings/general:touch-icon.help]]</small>
			</div>
		</div>
	</div>

	<div class="row mb-4">
		<div class="col-12 col-sm-2 settings-header">[[admin/settings/general:search]]</div>
		<div class="col-12 col-sm-10">
			<label for="post-sort-by">[[admin/settings/general:search-default-sort-by]]</label>
			<select id="post-sort-by" name="post-sort-by" class="form-control">
				<option value="relevance">[[search:relevance]]</option>
				<option value="timestamp">[[search:post-time]]</option>
				<option value="votes">[[search:votes]]</option>
				<option value="topic.lastposttime">[[search:last-reply-time]]</option>
				<option value="topic.title">[[search:topic-title]]</option>
				<option value="topic.postcount">[[search:number-of-replies]]</option>
				<option value="topic.viewcount">[[search:number-of-views]]</option>
				<option value="topic.votes">[[search:topic-votes]]</option>
				<option value="topic.timestamp">[[search:topic-start-date]]</option>
				<option value="user.username">[[search:username]]</option>
				<option value="category.name">[[search:category]]</option>
			</select>
		</div>
	</div>

	<div class="row mb-4">
		<div class="col-12 col-sm-2 settings-header">[[admin/settings/general:outgoing-links]]</div>
		<div class="col-12 col-sm-10">
			<div class="form-group form-check">
				<input type="checkbox" class="form-check-input" id="useOutgoingLinksPage" name="useOutgoingLinksPage">
				<label class="form-check-label" for="useOutgoingLinksPage">[[admin/settings/general:outgoing-links.warning-page]]</label>
			</div>

			<div class="form-group">
				<label for="outgoingLinks:whitelist">[[admin/settings/general:outgoing-links.whitelist]]</label><br />
				<input id="outgoingLinks:whitelist" name="outgoingLinks:whitelist" type="text" class="form-control" placeholder="subdomain.domain.com" data-field-type="tagsinput" />
			</div>
		</div>
	</div>
</form>

<!-- IMPORT admin/partials/settings/footer.tpl -->