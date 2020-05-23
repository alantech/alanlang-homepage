"use strict";

// Fix back button cache problem
window.onunload = function () { };

// Global variable, shared between modules
function playpen_text(playpen) {
    let code_block = playpen.querySelector("code");

    if (window.ace && code_block.classList.contains("editable")) {
        let editor = window.ace.edit(code_block);
        return editor.getValue();
    } else {
        return code_block.textContent;
    }
}

(function codeSnippets() {
    // Browserify creates a toplevel `require` function that you can use to get the modules
    const alanCompiler = require('alan-compiler')

    function run_rust_code(code_block) {
        var result_block = code_block.querySelector(".result");
        if (!result_block) {
            result_block = document.createElement('code');
            result_block.className = 'result hljs language-bash';

            code_block.append(result_block);
        }

        result_block.innerText = "Running...";

        let text = playpen_text(code_block);


        // transpile alan to js and eval it
        var oldLog = console.log;
        try {
            const js = alanCompiler('ln', 'js', text)
            result_block.innerText = "";
            console.log = function() {
                result_block.innerText += arguments[0];
                oldLog.apply(oldLog, arguments);
            };
            eval(js);
        } catch (e) {
            result_block.innerText = e.message;
        }
        console.log = oldLog;
    }

    // Syntax highlighting Configuration
    hljs.configure({
        tabReplace: '    ', // 4 spaces
        languages: [],      // Languages used for auto-detection
    });

    let code_nodes = Array
    .from(document.querySelectorAll('code'))
    // Don't highlight `inline code` blocks in headers.
    .filter(function (node) {return !node.parentElement.classList.contains("header"); });

    if (window.ace) {
        // language-rust class needs to be removed for editable
        // blocks or highlightjs will capture events
        Array
        .from(document.querySelectorAll('code.editable'))
        .forEach(function (block) { block.classList.remove('language-rust'); });

        Array
        .from(document.querySelectorAll('code:not(.editable)'))
        .forEach(function (block) { hljs.highlightBlock(block); });
    } else {
        code_nodes.forEach(function (block) { hljs.highlightBlock(block); });
    }

    // Adding the hljs class gives code blocks the color css
    // even if highlighting doesn't apply
    code_nodes.forEach(function (block) { block.classList.add('hljs'); });

    Array.from(document.querySelectorAll("code.language-rust")).forEach(function (block) {

        var lines = Array.from(block.querySelectorAll('.boring'));
        // If no lines were hidden, return
        if (!lines.length) { return; }
        block.classList.add("hide-boring");

        var buttons = document.createElement('div');
        buttons.className = 'buttons';
        buttons.innerHTML = "<button class=\"fa fa-expand\" title=\"Show hidden lines\" aria-label=\"Show hidden lines\"></button>";

        // add expand button
        var pre_block = block.parentNode;
        pre_block.insertBefore(buttons, pre_block.firstChild);

        pre_block.querySelector('.buttons').addEventListener('click', function (e) {
            if (e.target.classList.contains('fa-expand')) {
                e.target.classList.remove('fa-expand');
                e.target.classList.add('fa-compress');
                e.target.title = 'Hide lines';
                e.target.setAttribute('aria-label', e.target.title);

                block.classList.remove('hide-boring');
            } else if (e.target.classList.contains('fa-compress')) {
                e.target.classList.remove('fa-compress');
                e.target.classList.add('fa-expand');
                e.target.title = 'Show hidden lines';
                e.target.setAttribute('aria-label', e.target.title);

                block.classList.add('hide-boring');
            }
        });
    });

    if (window.playpen_copyable) {
        Array.from(document.querySelectorAll('pre code')).forEach(function (block) {
            var pre_block = block.parentNode;
            if (!pre_block.classList.contains('playpen')) {
                var buttons = pre_block.querySelector(".buttons");
                if (!buttons) {
                    buttons = document.createElement('div');
                    buttons.className = 'buttons';
                    pre_block.insertBefore(buttons, pre_block.firstChild);
                }

                var clipButton = document.createElement('button');
                clipButton.className = 'fa fa-copy clip-button';
                clipButton.title = 'Copy to clipboard';
                clipButton.setAttribute('aria-label', clipButton.title);
                clipButton.innerHTML = '<i class=\"tooltiptext\"></i>';

                buttons.insertBefore(clipButton, buttons.firstChild);
            }
        });
    }

    // Process playpen code blocks
    Array.from(document.querySelectorAll(".playpen")).forEach(function (pre_block) {
        // Add play button
        var buttons = pre_block.querySelector(".buttons");
        if (!buttons) {
            buttons = document.createElement('div');
            buttons.className = 'buttons';
            pre_block.insertBefore(buttons, pre_block.firstChild);
        }

        var runCodeButton = document.createElement('button');
        runCodeButton.className = 'fa fa-play play-button';
        runCodeButton.hidden = true;
        runCodeButton.title = 'Run this code';
        runCodeButton.setAttribute('aria-label', runCodeButton.title);

        buttons.insertBefore(runCodeButton, buttons.firstChild);
        runCodeButton.addEventListener('click', function (e) {
            run_rust_code(pre_block);
        });

        if (window.playpen_copyable) {
            var copyCodeClipboardButton = document.createElement('button');
            copyCodeClipboardButton.className = 'fa fa-copy clip-button';
            copyCodeClipboardButton.innerHTML = '<i class="tooltiptext"></i>';
            copyCodeClipboardButton.title = 'Copy to clipboard';
            copyCodeClipboardButton.setAttribute('aria-label', copyCodeClipboardButton.title);

            buttons.insertBefore(copyCodeClipboardButton, buttons.firstChild);
        }

        let code_block = pre_block.querySelector("code");
        if (window.ace && code_block.classList.contains("editable")) {
            var undoChangesButton = document.createElement('button');
            undoChangesButton.className = 'fa fa-history reset-button';
            undoChangesButton.title = 'Undo changes';
            undoChangesButton.setAttribute('aria-label', undoChangesButton.title);

            buttons.insertBefore(undoChangesButton, buttons.firstChild);

            undoChangesButton.addEventListener('click', function () {
                let editor = window.ace.edit(code_block);
                editor.setValue(editor.originalCode);
                editor.clearSelection();
            });
        }
    });
})();

(function themes() {
    var stylesheets = {
        ayuHighlight: document.querySelector("[href$='ayu-highlight.css']"),
        tomorrowNight: document.querySelector("[href$='tomorrow-night.css']"),
        highlight: document.querySelector("[href$='highlight.css']"),
        solarizedLightHljs: document.querySelector("[href$='solarized-light-hljs.css']"),
        solarizedDarkHljs: document.querySelector("[href$='solarized-dark-hljs.css']"),
    };

    function set_theme(theme) {
        let ace_theme;

        if (theme === 'coal' || theme === 'navy') {
            stylesheets.ayuHighlight.disabled = true;
            stylesheets.tomorrowNight.disabled = false;
            stylesheets.highlight.disabled = true;
            stylesheets.solarizedDarkHljs.disabled = true;
            stylesheets.solarizedLightHljs.disabled = true;
            ace_theme = "ace/theme/tomorrow_night";
        } else if (theme === 'ayu') {
            stylesheets.ayuHighlight.disabled = false;
            stylesheets.tomorrowNight.disabled = true;
            stylesheets.highlight.disabled = true;
            stylesheets.solarizedDarkHljs.disabled = true;
            stylesheets.solarizedLightHljs.disabled = true;
            ace_theme = "ace/theme/tomorrow_night";
        }  else if (theme  === 'solarized-dark') {
            stylesheets.ayuHighlight.disabled = true;
            stylesheets.tomorrowNight.disabled = true;
            stylesheets.highlight.disabled = true;
            stylesheets.solarizedDarkHljs.disabled = false;
            stylesheets.solarizedLightHljs.disabled = true;
            ace_theme = "ace/theme/solarized_dark";
        } else if (theme  === 'solarized-light') {
            stylesheets.ayuHighlight.disabled = true;
            stylesheets.tomorrowNight.disabled = true;
            stylesheets.highlight.disabled = true;
            stylesheets.solarizedLightHljs.disabled = false;
            stylesheets.solarizedDarkHljs.disabled = true;
            ace_theme = "ace/theme/solarized_light";
        } else {
            stylesheets.ayuHighlight.disabled = true;
            stylesheets.tomorrowNight.disabled = true;
            stylesheets.highlight.disabled = false;
            stylesheets.solarizedDarkHljs.disabled = true;
            stylesheets.solarizedLightHljs.disabled = true;
            ace_theme = "ace/theme/dawn";
        }

        if (window.ace && window.editors) {
            window.editors.forEach(function (editor) {
                editor.setTheme(ace_theme);
            });
        }
    }

    set_theme(default_theme);

})();

(function clipboard() {
    var clipButtons = document.querySelectorAll('.clip-button');

    function hideTooltip(elem) {
        elem.firstChild.innerText = "";
        elem.className = 'fa fa-copy clip-button';
    }

    function showTooltip(elem, msg) {
        elem.firstChild.innerText = msg;
        elem.className = 'fa fa-copy tooltipped';
    }

    var clipboardSnippets = new ClipboardJS('.clip-button', {
        text: function (trigger) {
            hideTooltip(trigger);
            let playpen = trigger.closest("pre");
            return playpen_text(playpen);
        }
    });

    Array.from(clipButtons).forEach(function (clipButton) {
        clipButton.addEventListener('mouseout', function (e) {
            hideTooltip(e.currentTarget);
        });
    });

    clipboardSnippets.on('success', function (e) {
        e.clearSelection();
        showTooltip(e.trigger, "Copied!");
    });

    clipboardSnippets.on('error', function (e) {
        showTooltip(e.trigger, "Clipboard error!");
    });
})();