if (typeof console != "undefined")
    if (typeof console.log != 'undefined')
        console.olog = console.log;
    else
        console.olog = function() {};
window.onerror = function(msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";

    if (string.indexOf(substring) > -1) {
        console.log('Script Error: See Browser Console for Detail');
    }

    var message = [
        'Message: ' + msg,
        'URL: ' + url,
        'Line: ' + lineNo,
        'Column: ' + columnNo
    ];

    console.log(message);
    return false;
};


console.log = function(param) {
    console.olog(param);
    var location = document.getElementById("consoleDiv");
    if (typeof(param) === "object") {
        var tree = JsonView.createTree(param);
        try {
            if (tree.value[0].indexOf("Message") !== -1) {
                tree.isError = true;
            }
        } catch (error) {}
        JsonView.render(tree, location);
    } else {
        JsonView.render(param, location);
    }
};

var JsonView = (function(exports) {
    var _typeof = function(obj) {
        var type;
        type = typeof(obj);

        if (type === 'object') {
            if (type.isArray) {
                type = 'array';
            }
        }
        return type;
    };

    function expandedTemplate() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var key = params.key,
            size = params.size;
        return "\n    <div class=\"line\">\n      <div class=\"caret-icon\"><i class=\"fas fa-caret-right\"></i></div>\n      <div class=\"json-key\">".concat(key, "</div>\n      <div class=\"json-size\">").concat(size, "</div>\n    </div>\n  ");
    }

    function notExpandedTemplate() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var key = params.key,
            value = params.value,
            type = params.type;
        var separator = '';
        if (type !== "error") {
            separator = ' <div class=\"json-separator\">:</div>\n';
        }
        return "\n    <div class=\"line\">\n      <div class=\"empty-icon\"></div>\n      <div class=\"json-key\">".concat(key, "</div>\n   ").concat(separator, "   <div class=\"json-value json-").concat(type, "\">").concat(value, "</div>\n    </div>\n  ");
    }

    function hideNodeChildren(node) {
        node.children.forEach(function(child) {
            child.el.classList.add('hide');

            if (child.isExpanded) {
                hideNodeChildren(child);
            }
        });
    }

    function showNodeChildren(node) {
        node.children.forEach(function(child) {
            child.el.classList.remove('hide');

            if (child.isExpanded) {
                showNodeChildren(child);
            }
        });
    }

    function setCaretIconDown(node) {
        if (node.children.length > 0) {
            var icon = node.el.querySelector('.fas');

            if (icon) {
                icon.classList.replace('fa-caret-right', 'fa-caret-down');
            }
        }
    }

    function setCaretIconRight(node) {
        if (node.children.length > 0) {
            var icon = node.el.querySelector('.fas');

            if (icon) {
                icon.classList.replace('fa-caret-down', 'fa-caret-right');
            }
        }
    }

    function toggleNode(node) {
        if (node.isExpanded) {
            node.el.querySelector('.hidden').classList.replace('hidden', 'scripted');
            node.isExpanded = false;
            setCaretIconRight(node);
            hideNodeChildren(node);
        } else {
            node.el.querySelector('.scripted').classList.replace('scripted', 'hidden');
            node.isExpanded = true;
            setCaretIconDown(node);
            showNodeChildren(node);
        }
    }

    function createContainerElement(tree) {
        var el = document.createElement('div');
        el.className = 'json-container';
        try {
            if (tree.isError) {
                el.className += '-error';
            }
        } catch (error) {}


        if (typeof(tree) !== 'object') {
            el.className += ' noonObject';
        }
        return el;
    }

    function createNodeElement(node) {
        var el = document.createElement('div');

        var getSizeString = function getSizeString(node) {
            var len = node.children.length;
            var parenthesis;
            parenthesis = '(' + len + ')';

            if (node.type === 'array') {
                return "<div class='line'>".concat(parenthesis).concat(getNodeInsides(node)).concat("</div>");
            }
            if (node.type === 'object') {
                return "<div class='line'>{".concat(len, "}").concat(getNodeInsides(node)).concat("</div>");
            }
            return null;
        };

        function getNodeInsides(node) {
            var insides = '<div class="scripted">→  ';
            if (node.type === 'array') {
                insides += '[ ';
            } else if (node.type === 'object') {
                insides += '{ ';
            }
            node.children.forEach(function(no) {
                if (node.type === 'object') {
                    insides += no.key + ": ";
                }
                try {
                    if (node.isError) {
                        insides += '<div class="json-error">';
                    } else {
                        insides += '<div class="json-' + no.type + '">';
                    }
                } catch (error) {
                    insides += '<div class="json-' + no.type + '">';
                }
                if (no.type === 'string')
                    insides += "'";
                if (no.type == 'object') {
                    insides += '{...}';
                } else {
                    insides += no.value;
                }
                if (no.type === 'string')
                    insides += "'";
                insides += '</div>';

                if (node.children[node.children.length - 1] !== no) {
                    insides += '<div class="white-comma">, </div>';
                }
            });
            if (node.type === 'array') {
                insides += ' ]';
            } else if (node.type === 'object') {
                insides += ' }';
            }
            insides += '</div>';
            return insides;
        }

        if (node.children.length > 0) {
            if (node.isError) {
                el.innerHTML = expandedTemplate({
                    key: " ",
                    size: getSizeString(node)
                });
            } else {
                el.innerHTML = expandedTemplate({
                    key: node.key,
                    size: getSizeString(node)
                });
            }
            var caretEl = el.querySelector('.caret-icon');
            caretEl.addEventListener('click', function() {
                toggleNode(node);
            });
        } else {
            if (node.parent.isError) {
                el.innerHTML = notExpandedTemplate({
                    key: " ",
                    value: node.value,
                    type: 'error'
                });
            } else {
                el.innerHTML = notExpandedTemplate({
                    key: node.key,
                    value: node.value,
                    type: _typeof(node.value)
                });
            }
        }

        var lineEl = el.children[0];

        if (node.parent !== null) {
            lineEl.classList.add('hide');
        }

        lineEl.style = 'margin-left: ' + node.depth * 18 + 'px;';
        return lineEl;
    }

    function getDataType(val) {
        var type = _typeof(val);

        if (Array.isArray(val)) type = 'array';
        if (val === null) type = 'null';
        return type;
    }

    function traverseTree(node, callback) {
        callback(node);

        if (node.children.length > 0) {
            node.children.forEach(function(child) {
                traverseTree(child, callback);
            });
        }
    }

    function createNode() {
        var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        return {
            key: opt.key || null,
            parent: opt.parent || null,
            value: opt.hasOwnProperty('value') ? opt.value : null,
            isExpanded: opt.isExpanded || false,
            type: opt.type || null,
            children: opt.children || [],
            el: opt.el || null,
            depth: opt.depth || 0
        };
    }

    function createSubnode(data, node) {
        if (_typeof(data) === 'object') {
            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i++) {
                var child = createNode({
                    value: data[keys[i]],
                    key: keys[i],
                    depth: node.depth + 1,
                    type: getDataType(data[keys[i]]),
                    parent: node
                });
                node.children.push(child);
                createSubnode(data[keys[i]], child);
            }
        }
    }

    function createTree(jsonData) {
        var data = jsonData;
        var rootNode = createNode({
            value: data,
            key: " ", //getDataType(data),
            type: getDataType(data)
        });
        createSubnode(data, rootNode);
        return rootNode;
    }

    function render(tree, targetElement) {

        var containerEl = createContainerElement(tree);

        if (typeof(tree) === 'object') {
            try {
                if (tree.value[0].indexOf("Message") !== -1) {
                    tree.isError = true;
                }
            } catch (error) {}
            traverseTree(tree, function(node) {
                node.el = createNodeElement(node);
                containerEl.appendChild(node.el);
            });
            try {
                if (tree.value[0].indexOf("Message") !== -1) {
                    tree.isError = true;
                    toggleNode(tree);
                }
            } catch (error) {}
        } else {
            containerEl.append(tree);
        }
        targetElement.appendChild(containerEl);
    }

    function expandChildren(node) {
        traverseTree(node, function(child) {
            child.el.classList.remove('hide');
            child.isExpanded = true;
            setCaretIconDown(child);
        });
    }

    function collapseChildren(node) {
        traverseTree(node, function(child) {
            child.isExpanded = false;
            if (child.depth > node.depth) child.el.classList.add('hide');
            setCaretIconRight(child);
        });
    }

    exports.collapseChildren = collapseChildren;
    exports.createTree = createTree;
    exports.expandChildren = expandChildren;
    exports.render = render;
    exports.traverseTree = traverseTree;

    return exports;

}({}));