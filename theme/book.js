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
    function fetch_with_timeout(url, options, timeout = 6000) {
        return Promise.race([
            fetch(url, options),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
        ]);
    }

    var playpens = Array.from(document.querySelectorAll(".playpen"));
    if (playpens.length > 0) {
        fetch_with_timeout("https://play.rust-lang.org/meta/crates", {
            headers: {
                'Content-Type': "application/json",
            },
            method: 'POST',
            mode: 'cors',
        })
        .then(response => response.json())
        .then(response => {
            // get list of crates available in the rust playground
            let playground_crates = response.crates.map(item => item["id"]);
            playpens.forEach(block => handle_crate_list_update(block, playground_crates));
        });
    }

    function handle_crate_list_update(playpen_block, playground_crates) {
        // update the play buttons after receiving the response
        update_play_button(playpen_block, playground_crates);

        // and install on change listener to dynamically update ACE editors
        if (window.ace) {
            let code_block = playpen_block.querySelector("code");
            if (code_block.classList.contains("editable")) {
                let editor = window.ace.edit(code_block);
                editor.addEventListener("change", function (e) {
                    update_play_button(playpen_block, playground_crates);
                });
                // add Ctrl-Enter command to execute rust code
                editor.commands.addCommand({
                    name: "run",
                    bindKey: {
                        win: "Ctrl-Enter",
                        mac: "Ctrl-Enter"
                    },
                    exec: _editor => run_rust_code(playpen_block)
                });
            }
        }
    }

    // updates the visibility of play button based on `no_run` class and
    // used crates vs ones available on http://play.rust-lang.org
    function update_play_button(pre_block, playground_crates) {
        var play_button = pre_block.querySelector(".play-button");

        // skip if code is `no_run`
        if (pre_block.querySelector('code').classList.contains("no_run")) {
            play_button.classList.add("hidden");
            return;
        }

        // get list of `extern crate`'s from snippet
        var txt = playpen_text(pre_block);
        var re = /extern\s+crate\s+([a-zA-Z_0-9]+)\s*;/g;
        var snippet_crates = [];
        var item;
        while (item = re.exec(txt)) {
            snippet_crates.push(item[1]);
        }

        // check if all used crates are available on play.rust-lang.org
        var all_available = snippet_crates.every(function (elem) {
            return playground_crates.indexOf(elem) > -1;
        });

        if (all_available) {
            play_button.classList.remove("hidden");
        } else {
            play_button.classList.add("hidden");
        }
    }

    function run_rust_code(code_block) {
        var result_block = code_block.querySelector(".result");
        if (!result_block) {
            result_block = document.createElement('code');
            result_block.className = 'result hljs language-bash';

            code_block.append(result_block);
        }

        let text = playpen_text(code_block);
        let classes = code_block.querySelector('code').classList;
        let has_2018 = classes.contains("edition2018");
        let edition = has_2018 ? "2018" : "2015";

        var params = {
            version: "stable",
            optimize: "0",
            code: text,
            edition: edition
        };

        if (text.indexOf("#![feature") !== -1) {
            params.version = "nightly";
        }

        result_block.innerText = "Running...";

        fetch_with_timeout("https://play.rust-lang.org/evaluate.json", {
            headers: {
                'Content-Type': "application/json",
            },
            method: 'POST',
            mode: 'cors',
            body: JSON.stringify(params)
        })
        .then(response => response.json())
        .then(response => result_block.innerText = response.result)
        .catch(error => result_block.innerText = "Playground Communication: " + error.message);
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
            stylesheets.solarizedDarkHljs.disabled = true;
            stylesheets.solarizedLightHljs.disabled = false;
            ace_theme = "ace/theme/solarized_light";
        } else if (theme  === 'solarized-light') {
            stylesheets.ayuHighlight.disabled = true;
            stylesheets.tomorrowNight.disabled = true;
            stylesheets.highlight.disabled = true;
            stylesheets.solarizedLightHljs.disabled = true;
            stylesheets.solarizedDarkHljs.disabled = false;
            ace_theme = "ace/theme/solarized_dark";
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