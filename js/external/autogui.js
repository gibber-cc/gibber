(function() {

var Interface = Gibber.Environment.Interface

Interface.autogui = {
  hasPageButtons: false,
  children: [
    [{
      "bounds": [0, 0, 1, 1],
      "widget": null,
      "sacrosanct": false,
      "parent": null,
      "id": 0,
      "children": [], 
    },]
  ],

  getBestChildForNewWidget: function(page) {
    var _maxSize = 0;
    page = 0;
    if (typeof this.children[page] === "undefined") {
      this.children[page] = [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [],
      }, ];
    }
    var bestChild = this.children[page][0];

    // TODO include sacrosanct check

    function check(child) {
      if (child.children.length === 0) {
        if (child.widget === null) {
          if (child.bounds[2] + child.bounds[3] > _maxSize) {
            bestChild = child;
            _maxSize = child.bounds[2] + child.bounds[3];
          }
        } else {
          if ((child.bounds[2] + child.bounds[3]) / 2 > _maxSize) {
            bestChild = child;
            _maxSize = (child.bounds[2] + child.bounds[3]) / 2;
          }
        }
      } else {;
        for (var i = 0; i < child.children.length; i++) {
          var _child = child.children[i];
          check(_child, _maxSize);
        }
      }
    }

    check(bestChild);

    return bestChild;
  },

  placeWidget: function(_widget, sacrosanct) {
    if (_widget === null) console.log("ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT ALERT");

    var maxSize = 0;
    var bestDiv = -1;
    var bestChild = null;

    bestChild = this.getBestChildForNewWidget(0);

    if (bestChild.widget === null) {
      bestChild.widget = _widget;
      _widget.bounds = bestChild.bounds;
      _widget.div = bestChild;
    } else {
      var w = bestChild.widget;

      var splitDir = (bestChild.bounds[2] > bestChild.bounds[3]) ? 0 : 1; // will the cell be split horizontally or vertically?

      var widgetWidth, widgetHeight;
      widgetWidth = (splitDir == 0) ? bestChild.bounds[2] / 2 : bestChild.bounds[2];
      widgetHeight = (splitDir == 1) ? bestChild.bounds[3] / 2 : bestChild.bounds[3];

      var div1 = {
        "bounds": [bestChild.bounds[0], bestChild.bounds[1], widgetWidth, widgetHeight],
        "widget": w,
        "sacrosanct": false,
        "parent": bestChild,
        "children": [],
      }

      var newDivX = (splitDir == 0) ? bestChild.bounds[0] + widgetWidth : bestChild.bounds[0];
      var newDivY = (splitDir == 1) ? bestChild.bounds[1] + widgetHeight : bestChild.bounds[1];

      var div2 = {
        "bounds": [newDivX, newDivY, widgetWidth, widgetHeight],
        "widget": _widget,
        "sacrosanct": sacrosanct,
        "parent": bestChild,
        "children": [],
      }

      div1.widget.div = div1;
      div1.widget.bounds = div1.bounds;

      div2.widget.bounds = div2.bounds;
      div2.widget.div = div2;

      bestChild.children.push(div1);
      bestChild.children.push(div2);
    }
  },

  removeWidget: function(_widget) {
    _widget.div.widget = null;
    var parent = _widget.div.parent;
    if (parent != null) {
      var childNumber = jQuery.inArray(_widget.div, parent.children);
      // determine if sibling is already empty, if so, remove sibling and self from parent array
      var siblingNumber = (childNumber === 1) ? 0 : 1;
      if (parent.children[siblingNumber].widget == null) {
        parent.children = [];
        parent.widget = null;
      }
    } else {
      _widget.div.children = [];
    }
  },

  reset: function() {
    this.children = [
      [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [],
      },]
    ];
  },

  redoLayout: function() {
    this.children = [
      [{
        "bounds": [0, 0, 1, 1],
        "widget": null,
        "sacrosanct": false,
        "parent": null,
        "id": 0,
        "children": [],
      },]
    ];

    for (var i = 0; i < panel.children.length; i++) {
      var w = panel.children[i];
      this.placeWidget(w);
    }
  },
};

})()