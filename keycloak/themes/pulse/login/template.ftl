<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}"<#if realm.internationalizationEnabled> lang="${locale.currentLanguageTag}"</#if>>
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />
    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <#if authenticationSession??>
        <script type="module">
            import { checkCookiesAndSetTimer } from "${url.resourcesPath}/js/authChecker.js";
            checkCookiesAndSetTimer(
              "${authenticationSession.authSessionId}",
              "${authenticationSession.tabId}",
              "${url.ssoLoginInOtherTabsUrl}"
            );
        </script>
    </#if>
</head>

<body id="keycloak-bg" class="pulse-body ${properties.kcBodyClass!}">
<div class="pulse-page">
    <aside class="pulse-showcase" aria-hidden="true">
        <div class="pulse-showcase-inner">
            <img src="${url.resourcesPath}/img/phone-showcase.svg" alt="" class="pulse-showcase-img" />
        </div>
    </aside>

    <div class="pulse-auth"
        x-data="{
            open: false,
            toggle() {
                if (this.open) return this.close()
                this.$refs.button?.focus()
                this.open = true
            },
            close(focusAfter) {
                if (!this.open) return
                this.open = false
                focusAfter && focusAfter.focus()
            }
        }"
        x-on:keydown.escape.prevent.stop="close($refs.button)"
        x-on:focusin.window="! $refs.panel?.contains($event.target) && close()"
        x-id="['language-select']"
    >
        <main class="pulse-auth-main">
            <div class="pulse-card">
                <header class="pulse-card-header">
                    <#nested "header">
                    <#if realm.internationalizationEnabled && locale.supported?size gt 1>
                    <div class="pulse-locale">
                        <button
                            x-ref="button"
                            x-on:click="toggle()"
                            :aria-expanded="open"
                            :aria-controls="$id('language-select')"
                            class="pulse-locale-btn"
                            type="button"
                            aria-haspopup="listbox"
                        >
                            ${locale.current}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>
                        </button>
                        <ul
                            class="pulse-locale-menu"
                            :id="$id('language-select')"
                            x-on:click.outside="close($refs.button)"
                            role="listbox"
                            x-transition
                            x-ref="panel"
                            x-show="open"
                            style="display: none;"
                        >
                            <#list locale.supported as l>
                            <li role="presentation">
                                <button class="pulse-locale-item ${(locale.current == l.label)?then('is-active', '')}"
                                    role="option"
                                    onclick="window.location = '${l.url}'">
                                    ${l.label}
                                </button>
                            </li>
                            </#list>
                        </ul>
                    </div>
                    </#if>
                </header>

                <div class="pulse-card-body">
                    <#if !(auth?has_content && auth.showUsername() && !auth.showResetCredentials())>
                        <#if displayRequiredFields>
                            <p class="pulse-required"><span>*</span> ${msg("requiredFields")}</p>
                        </#if>
                    <#else>
                        <#if displayRequiredFields>
                            <p class="pulse-required"><span>*</span> ${msg("requiredFields")}</p>
                        </#if>
                        <#nested "show-username">
                        <div id="kc-username" class="pulse-username-bar">
                            <span id="kc-attempted-username">${auth.attemptedUsername}</span>
                            <a id="reset-login" href="${url.loginRestartFlowUrl}" aria-label="${msg('restartLoginTooltip')}">
                                ${msg("restartLoginTooltip")}
                            </a>
                        </div>
                    </#if>

                    <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                    <div class="pulse-alert pulse-alert--${message.type}">
                        ${kcSanitize(message.summary)?no_esc}
                    </div>
                    </#if>

                    <#nested "form">

                    <#if auth?has_content && auth.showTryAnotherWayLink()>
                    <form id="kc-select-try-another-way-form" action="${url.loginAction}" method="post">
                        <input type="hidden" name="tryAnotherWay" value="on"/>
                        <a href="#" class="pulse-link" onclick="document.forms['kc-select-try-another-way-form'].submit();return false;">
                            ${msg("doTryAnotherWay")}
                        </a>
                    </form>
                    </#if>
                </div>

                <footer class="pulse-card-footer">
                    <#nested "socialProviders">
                </footer>
            </div>

            <#if displayInfo>
            <div class="pulse-card pulse-card--signup">
                <#nested "info">
            </div>
            </#if>

            <footer class="pulse-footer">
                <nav class="pulse-footer-links" aria-label="Footer">
                    <a href="#">About</a>
                    <a href="#">Blog</a>
                    <a href="#">Jobs</a>
                    <a href="#">Help</a>
                    <a href="#">API</a>
                    <a href="#">Privacy</a>
                    <a href="#">Terms</a>
                    <a href="#">Locations</a>
                    <a href="#">Pulse Lite</a>
                    <a href="#">Contact</a>
                </nav>
                <p class="pulse-footer-copy">&copy; ${.now?string('yyyy')} Pulse</p>
            </footer>
        </main>
    </div>
</div>
</body>
</html>
</#macro>
