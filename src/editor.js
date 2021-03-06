var EFH = window.EFH || {};
window.EFH = EFH;

Kinetic.Group.prototype.find = function(pattern) {
  if (pattern[0] === '.') {
    var name = pattern.substring(1);
    return this.children.filter(function(c) {
      return c.getName() == name;
    });
  } else {
    return [];
  }
};

EFH.LevelEditor = LevelEditor = function(container, options) {
  this._options = options;
  this._options.container = container;
  this.init();
};

LevelEditor.prototype.init = function() {
  var self = this;
  var container = document.getElementById(this._options.container);
  var board = this.createDrawingBoardElement(container);
  var kinetic = this.createKineticElement(container);
  var stage = new Kinetic.Stage({ container: kinetic.id, width:this._options.width, height:this._options.height });
  var layer = new Kinetic.Layer();
  var group = new Kinetic.Group({
    x: this._options.width / 2 - 50,
    y: this._options.height / 2 - 50,
    draggable: true
  });

  group.on('dragend', function() {
    var goal = this.find('.goal')[0];
    var height = goal.getHeight(),
        width = goal.getWidth(),
        x = goal.parent.getX(),
        y = goal.parent.getY();
    if (self._options.onGoalMove) {
      self._options.onGoalMove({x: x, y: y, width: width, height: height});
    }
  });

  layer.add(group);
  stage.add(layer);
  var goal = new Kinetic.Rect({width: 100, height: 100, fill: 'green', name: 'goal'});
  group.add(goal);
  this.addAnchor(group, 0, 0, 'topLeft');
  this.addAnchor(group, 100, 0, 'topRight');
  this.addAnchor(group, 100, 100, 'bottomRight');
  this.addAnchor(group, 0, 100, 'bottomLeft');

  this.addPuck(layer);

  this._board = board;
  this._kinetic = kinetic;
  this._layer = layer;
  this._group = group;
  this._stage = stage;
  this._goal = goal;

  setTimeout(function() {
    self._drawingBoard = new DrawingBoard.Board(board.id, {
      background: false,
      webStorage: false,
      size: 5,
      controls: [
        "Color",
        "DrawingMode",
        {
          Size: {
            range: {
              min: 5,
              max: 50
            }
          }
        },
      "Navigation"
      ]
    });
  }, 0);
};

LevelEditor.prototype.createKineticElement = function(container) {
  var kinetic = document.createElement('div');
  kinetic.id = 'kinetic';
  kinetic.style.display = 'none';
  kinetic.setAttribute('style', 
      'width:' + this._options.width + 'px;' +
      'height:' + this._options.height + 'px;' +
      'border:1px solid gray;' + 
      'display:none;');
  container.appendChild(kinetic);
  return kinetic;
};

LevelEditor.prototype.createDrawingBoardElement = function(container) {
  var board = document.createElement('div');
  board.id = 'drawingboard';
  board.setAttribute('style', "width:" + this._options.width + "px; height:" +
      (this._options.height + 35) + "px");
  container.appendChild(board);
  return board;
};

LevelEditor.prototype.update = function(activeAnchor) {
  var group = activeAnchor.getParent();

  var topLeft = group.find('.topLeft')[0];
  var topRight = group.find('.topRight')[0];
  var bottomRight = group.find('.bottomRight')[0];
  var bottomLeft = group.find('.bottomLeft')[0];
  var goal = group.find('.goal')[0];

  var anchorX = activeAnchor.getX();
  var anchorY = activeAnchor.getY();

  // update anchor positions
  switch (activeAnchor.getName()) {
    case 'topLeft':
      topRight.setY(anchorY);
      bottomLeft.setX(anchorX);
      break;
    case 'topRight':
      topLeft.setY(anchorY);
      bottomRight.setX(anchorX);
      break;
    case 'bottomRight':
      bottomLeft.setY(anchorY);
      topRight.setX(anchorX); 
      break;
    case 'bottomLeft':
      bottomRight.setY(anchorY);
      topLeft.setX(anchorX); 
      break;
  }

  goal.setPosition(topLeft.getPosition());

  var width = topRight.getX() - topLeft.getX();
  var height = bottomLeft.getY() - topLeft.getY();
  if(width && height) {
    goal.setSize({width:width, height: height});
  }
};

LevelEditor.prototype.addAnchor = function(group, x, y, name) {
  var stage = group.getStage();
  var layer = group.getLayer();
  var self = this;

  var anchor = new Kinetic.Circle({
    x: x,
    y: y,
    stroke: '#666',
    fill: '#ddd',
    strokeWidth: 2,
    radius: 8,
    name: name,
    draggable: true,
    dragOnTop: false
  });

  anchor.on('dragmove', function() {
    self.update(this);
    layer.draw();
  });
  anchor.on('mousedown touchstart', function() {
    group.setDraggable(false);
    this.moveToTop();
  });
  anchor.on('dragend', function() {
    group.setDraggable(true);
    layer.draw();
  });
  // add hover styling
  anchor.on('mouseover', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'pointer';
    this.setStrokeWidth(4);
    layer.draw();
  });
  anchor.on('mouseout', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'default';
    this.setStrokeWidth(2);
    layer.draw();
  });

  group.add(anchor);
};

LevelEditor.prototype.editGoal = function() {
  var self = this;
  var imgObject = new Image();
  imgObject.onload = function() {
    var img = new Kinetic.Image({
      x: 0,
      y: 0,
      width: self._options.width,
      height: self._options.height,
      image: imgObject
    });


    self._layer.add(img);
    self._group.moveToTop();
    self._puck.moveToTop();
    self._stage.draw();

    self._board.style.display = 'none';
    self._kinetic.style.display = 'block';
  };

  this._background = this._drawingBoard.getImg();
  imgObject.src = this._background;
};

LevelEditor.prototype.draw = function() {
  this._board.style.display = 'block';
  this._kinetic.style.display = 'none';
};

LevelEditor.prototype.addPuck = function(layer) {
  var self = this,
      img = new Image();

  img.onload = function() {
    var image = new Kinetic.Image({
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      image: img,
      draggable: true
    });

    image.on('dragend', function() {
      if (self._options.onPuckMove) {
        self._options.onPuckMove({
          x: image.getX() + 20,
          y: image.getY() + 20
        });
      }
    });

    self._puck = image;
    layer.add(image);
    image.moveToTop();
    layer.draw();
  };

  img.src = "/img/puck.png";
};

LevelEditor.prototype.goal = function () {
  return {
    x: this._goal.parent.getX() + this._goal.getX(),
    y: this._goal.parent.getY() + this._goal.getY(),
    width: this._goal.getWidth(),
    height: this._goal.getHeight()
  };
};

LevelEditor.prototype.getData = function() {
  return {
    backgroundUrl: this._background,
    width: this._options.width,
    height: this._options.height,
    puckPosition: {
      x: this._puck.getX() + 20,
      y: this._puck.getY() + 20
    },
    goal: this.goal()
  };
};

