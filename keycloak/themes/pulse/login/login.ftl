<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        <a href="/" class="pulse-logo" aria-label="Pulse home">
            <img src="${url.resourcesPath}/img/pulse-logo.svg" alt="Pulse" width="175" height="51" />
        </a>
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                <form id="kc-form-login" class="pulse-form" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                    <#if !usernameHidden??>
                    <div class="pulse-field">
                        <label for="username" class="visually-hidden">
                            <#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>
                        </label>
                        <input
                            tabindex="1"
                            id="username"
                            name="username"
                            value="${(login.username!'')}"
                            type="text"
                            autofocus
                            autocomplete="username"
                            placeholder="<#if !realm.loginWithEmailAllowed>${msg("username")}<#elseif !realm.registrationEmailAsUsername>${msg("usernameOrEmail")}<#else>${msg("email")}</#if>"
                            aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                            class="<#if messagesPerField.existsError('username','password')>pulse-input--error</#if>"
                        />
                    </div>
                    </#if>

                    <div class="pulse-field">
                        <label for="password" class="visually-hidden">${msg("password")}</label>
                        <div class="pulse-password-wrap">
                            <input
                                tabindex="2"
                                id="password"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                placeholder="${msg("password")}"
                                aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                class="<#if messagesPerField.existsError('username','password')>pulse-input--error</#if>"
                            />
                            <button class="pulse-password-toggle" type="button" aria-label="${msg('showPassword')}"
                                aria-controls="password" data-password-toggle
                                data-icon-show="${properties.kcFormPasswordVisibilityIconShow!}"
                                data-icon-hide="${properties.kcFormPasswordVisibilityIconHide!}"
                                data-label-show="${msg('showPassword')}"
                                data-label-hide="${msg('hidePassword')}">
                                Show
                            </button>
                        </div>
                    </div>

                    <#if messagesPerField.existsError('username','password')>
                    <p id="input-error" class="pulse-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                    </p>
                    </#if>

                    <#if realm.rememberMe && !usernameHidden??>
                    <div class="pulse-remember">
                        <label>
                            <#if login.rememberMe??>
                            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked>
                            <#else>
                            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox">
                            </#if>
                            ${msg("rememberMe")}
                        </label>
                    </div>
                    </#if>

                    <div id="kc-form-buttons">
                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                        <button tabindex="4" class="pulse-btn pulse-btn--primary" name="login" id="kc-login" type="submit">
                            ${msg("doLogIn")}
                        </button>
                    </div>

                    <#if realm.resetPasswordAllowed>
                    <a tabindex="5" class="pulse-forgot" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                    </#if>
                </form>
                </#if>
            </div>
        </div>
        <script>
            (function () {
                const form = document.getElementById('kc-form-login');
                if (!form) return;
                const btn = document.getElementById('kc-login');
                const fields = form.querySelectorAll('#username, #password');
                function sync() {
                    let ok = true;
                    fields.forEach(function (el) { if (!el.value.trim()) ok = false; });
                    btn.disabled = !ok;
                }
                fields.forEach(function (el) { el.addEventListener('input', sync); });
                sync();

                const toggle = form.querySelector('[data-password-toggle]');
                const pwd = document.getElementById('password');
                if (toggle && pwd) {
                    toggle.addEventListener('click', function () {
                        const show = pwd.type === 'password';
                        pwd.type = show ? 'text' : 'password';
                        toggle.textContent = show ? 'Hide' : 'Show';
                        toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
                    });
                }
            })();
        </script>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
        <p class="pulse-signup-text">
            ${msg("noAccount")}
            <a tabindex="6" href="${url.registrationUrl}">${msg("doRegister")}</a>
        </p>
        </#if>
    <#elseif section = "socialProviders">
        <#if realm.password && social.providers??>
        <div id="kc-social-providers" class="pulse-social">
            <div class="pulse-divider"><span>OR</span></div>
            <ul class="pulse-social-list">
                <#list social.providers as p>
                <li>
                    <a id="social-${p.alias}" class="pulse-social-btn" aria-label="${p.displayName}" href="${p.loginUrl}">
                        <#if p.alias == "facebook">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 448 512"><path fill="currentColor" d="M448 56.7v398.5c0 13.7-11.1 24.7-24.7 24.7H309.1V306.5h58.2l8.7-67.6h-67v-43.2c0-19.6 5.4-32.9 33.5-32.9h35.8v-60.5c-6.2-.8-27.4-2.7-52.2-2.7-51.6 0-87 31.5-87 89.4v49.9h-58.4v67.6h58.4V480H24.7C11.1 480 0 468.9 0 455.3V56.7C0 43.1 11.1 32 24.7 32h398.5c13.7 0 24.8 11.1 24.8 24.7z"/></svg>
                        Log in with Facebook
                        <#elseif p.alias == "google">
                        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>
                        Log in with Google
                        <#else>
                        ${p.displayName!}
                        </#if>
                    </a>
                </li>
                </#list>
            </ul>
        </div>
        </#if>
    </#if>
</@layout.registrationLayout>
