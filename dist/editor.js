var EFH = window.EFH || {};
window.EFH = EFH;

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
  var stage = new Kinetic.Stage({ container: kinetic.id, width:700, height:365 });
  var layer = new Kinetic.Layer();
  var group = new Kinetic.Group({
    x: this._options.width / 2 - 50,
    y: this._options.height / 2 - 50,
    draggable: true
  });

  group.on('dragend', function() {
    var goal = this.find('.goal')[0];
    var height = rect.getHeight(),
        width = rect.getWidth(),
        x = rect.parent.getX(),
        y = rect.parent.getY();
    if (self._options.onGoalMove) {
      self._options.onGoalMove({x: x, y: y, width: width, height: height});
    }
  });

  layer.add(group);
  stage.add(layer);
  var rect = new Kinetic.Rect({width: 100, height: 100, fill: 'green', name: 'goal'});
  group.add(rect);
  this.addAnchor(group, 0, 0, 'topLeft');
  this.addAnchor(group, 100, 0, 'topRight');
  this.addAnchor(group, 100, 100, 'bottomRight');
  this.addAnchor(group, 0, 100, 'bottomLeft');

  this._board = board;
  this._kinetic = kinetic;
  this._layer = layer;
  this._group = group;
  this._stage = stage;

  setTimeout(function() {
    self._drawingBoard = new DrawingBoard.Board(board.id);
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
      this._options.height + "px");
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

  var anchorX = activeAnchor.x();
  var anchorY = activeAnchor.y();

  // update anchor positions
  switch (activeAnchor.name()) {
    case 'topLeft':
      topRight.y(anchorY);
      bottomLeft.x(anchorX);
      break;
    case 'topRight':
      topLeft.y(anchorY);
      bottomRight.x(anchorX);
      break;
    case 'bottomRight':
      bottomLeft.y(anchorY);
      topRight.x(anchorX); 
      break;
    case 'bottomLeft':
      bottomRight.y(anchorY);
      topLeft.x(anchorX); 
      break;
  }

  goal.setPosition(topLeft.getPosition());

  var width = topRight.x() - topLeft.x();
  var height = bottomLeft.y() - topLeft.y();
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
      width: 700,
      height: 400,
      image: imgObject
    });


    self._layer.add(img);
    self._group.moveToTop();
    self._stage.draw();

    self._board.style.display = 'none';
    self._kinetic.style.display = 'block';
  };

  imgObject.src = this._drawingBoard.getImg();
};

