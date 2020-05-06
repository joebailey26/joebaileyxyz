exports.onRouteUpdate = ({ location }) => {
    document.querySelectorAll("figure a").forEach(function(e) {
        e.setAttribute('data-featherlight', 'image');
    })

    if (typeof window !== `undefined`) {
        require('./src/js/cookies')

        // Check Cookies
        function getCookie(name) {
            var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
            return v ? v[2] : null;
        }

        // Create a script tag in the Header
        function createScript(url) {
            const script = document.createElement('script')
            script.src = url
            document.getElementsByTagName('head')[0].appendChild(script)
            const script2 = document.createElement('script')
            script2.text = "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments)};gtag('js', new Date());gtag('config', 'UA-140457046-3')"
            document.getElementsByTagName('head')[0].appendChild(script2)
            
        };

        // If cookies are accepted then apply JavaScript
        if (getCookie('cookieconsent_status') === 'dismiss') {
            createScript('//www.googletagmanager.com/gtag/js?id=UA-140457046-3')
        }

        /*Cookie Policy Init*/
        window.cookieconsent.initialise({
            "palette": {
                "popup": {
                    "background": "#38786a",
                    "text": "#ffffff"
                },
                "button": {
                    "background": "#282828",
                    "text": "#ffffff"
                }
            },
            "theme": "edgeless",
            "content": {
                "href": "https://joebailey.xyz/cookie-policy"
            }
        })
        // If cookie accept button is pressed then apply JavaScript
        if (getCookie('cookieconsent_status') == null) {
            document.querySelector('.cc-btn.cc-dismiss').addEventListener("click", function(event) {
                createScript('//www.googletagmanager.com/gtag/js?id=UA-140457046-3')
            })
        }
    }

    if (location.pathname === "/") {
        /* Download background image */
        async function loadStuff() {
            var win, doc, img, header, enhancedClass, i, images
            
            win = window
            doc = win.document
            img = new Image()
            header = doc.querySelector('.page-header')
            enhancedClass = 'page-header-enhanced'

            function preload() {
                for (i = 0; i < preload.arguments.length; i++) {
                    images[i] = new Image()
                    images[i].src = preload.arguments[i]
                }
            }
            if (window.innerWidth < 992) {
                if (document.getElementsByTagName('BODY')[0].classList.contains("webp")) {
                    await preload("../img/mobile-header.webp")
                }
                else if (document.getElementsByTagName('BODY')[0].classList.contains("no-webp")) {
                    await preload("../img/mobile-header.jpg")
                }
            }
            else {
                if (document.getElementsByTagName('BODY')[0].classList.contains("webp")) {
                    await preload("../img/header.webp")
                }
                else if (document.getElementsByTagName('BODY')[0].classList.contains("no-webp")) {
                    await preload("../img/header.jpg")
                }
            }

            header.classList.add(enhancedClass)
        }
        loadStuff()
    }
}
