(function($) {
  var zoomerMethods = {
    init: function(options) {
      return this.each(function() {
        var data = $(this).data('smartZoomer');
        var configOptions = options;
        var actHeight = $(this).innerHeight();
        var actWidth = $(this).innerWidth();
        var x = (!options || !options.x) ? 0 : options.x
        var y = (!options || !options.y) ? 0 : options.y
        var currentRatio = (!options || !options.currentRatio) ? 1 : options.currentRatio
        var draggingEnabled = (!options || !options.draggingDisabled) ? 1 : 0
        var mainDiv = this;
        $(mainDiv).addClass('smartZoomableContent');
        $("img", mainDiv).addClass('mainZoomableImage');
        var showCropOnly = function(c) {
          if(data.timeout != null) {
            clearTimeout(data.timeout)
          }
          $(mainDiv).css({
            overflow: "hidden"
            ,
            width: data.actWidth
            ,
            height: data.actHeight
          });
          var heightRatio = c.r, widthRatio = c.r;
          data.currentRatio = c.r;
          var width = data.actWidth * widthRatio, height = data.actHeight * heightRatio;
          data.imgHeight = height;
          data.imgWidth = width;
          c.x = ((data.imgWidth - c.x) > data.actWidth) ? c.x : (data.imgWidth - data.actWidth);
          c.x = c.x < 0 ? 0 : c.x;
          c.y = ((data.imgHeight - c.y) > data.actHeight) ? c.y : (data.imgHeight - data.actHeight);
          c.y = c.y < 0 ? 0 : c.y;
          data.x = c.x;
          data.y = c.y;
          var top = c.y, left = c.x;
          var thumbnailCssProps = {
            width: data.thumbWidth / c.r
            ,
            height: data.thumbHeight / c.r
            ,
            top: (top/width*data.thumbWidth)+"px"
            ,
            left: (left/height*data.thumbHeight)+"px"
          };
          if(c.notAnimate) {
            $(".visibleArea", data.thumbnail).css(thumbnailCssProps);
          }
          else {
            $(".visibleArea", data.thumbnail).animate(thumbnailCssProps);
          }
          $(".mainZoomableImage", $(mainDiv)).css({
            position: "relative"
          });
          var zoomCssProps = {
            top: (-1 * top)+"px"
            ,
            left: (-1 * left)+"px"
            ,
            width: width+"px"
            ,
            height: height+"px"
          };
          if(c.notAnimate) {
            $(".mainZoomableImage", $(mainDiv)).css(zoomCssProps);
          }
          else {
            $(".mainZoomableImage", $(mainDiv)).animate(zoomCssProps);
          }
          $(data.mainDiv).trigger('zoomChanged', [data.mainDiv, data.x, data.y, data.currentRatio])
          $(data.zoomer).slider('value', data.currentRatio);
          clearTimeout(data.timeout);
        }
        $(this).data('smartZoomer', {
          actHeight: actHeight
          ,
          mouseMoveEventHandler: null
          ,
          mainDiv: mainDiv
          ,
          actWidth: actWidth
          ,
          showCropOnly: showCropOnly
          ,
          options: configOptions
          ,
          currentRatio: currentRatio
          ,
          imgWidth: actWidth
          ,
          draggingEnabled: draggingEnabled
          ,
          imgHeight: actHeight
          ,
          startX: 0
          ,
          startY: 0
          ,
          x: x
          ,
          y: y
        });
        data = $(this).data('smartZoomer');
        data.mouseWheelFn = function(event, delta){
          delta = delta || (event.wheelDelta ? event.wheelDelta / 120 : (event.detail) ? -event.detail/3 : 0);
          var nextRatio = (data.currentRatio + ((typeof(delta) == 'undefined' || delta == null) ? 1 : delta));
          if(nextRatio <= 0) {
            nextRatio = 1;
          }
          else if (nextRatio > 10) {
            nextRatio = 10;
          }
          var coord = {
            x: (data.x / data.currentRatio) * nextRatio,
            y: (data.y / data.currentRatio) * nextRatio,
            r: nextRatio
          };
          data.showCropOnly(coord);
          $(data.zoomer).slider('value', coord.r);
          return true;
        };
        
        data.mouseDownFn = function(e) {
          $(data.mainDiv).css({
            cursor: "move"
          });
          data.startX = e.pageX - $(data.mainDiv).offset().left;
          data.startY = e.pageY - $(data.mainDiv).offset().top;
          data.mouseMoveEventHandler = function(){
            var e = data.lastMouseMoveEvent
            data.moveImage(e, "true");
            return true;
          };
          data.mouseMoveInterval = setInterval(data.mouseMoveEventHandler, 50);
          $(".mainZoomableImage", $(data.mainDiv)).mousemove(function(e){
            data.lastMouseMoveEvent = e;
          });
          return true;
        }
        data.moveImage = function(e, animate) {
          if(e == null) {
            return true;
          }
          if(e.pageX == data.pageX && e.pageY == data.pageY) {
            return true;
          }
          data.pageX = e.pageX;
          data.pageY = e.pageY;
          var endX = e.pageX - $(data.mainDiv).offset().left;
          var endY = e.pageY - $(data.mainDiv).offset().top;
          var deltaX = (data.startX - endX)
          var deltaY = (endY - data.startY)
          var newX = data.x + deltaX
          var newY = data.y - deltaY
          data.startX = endX
          data.startY = endY
          var coord = {
            x:  newX
            ,
            y:  newY
            ,
            r: data.currentRatio
            ,
            notAnimate: animate
          };
          data.showCropOnly(coord);
        }
        data.mouseUpFn = function(e) {
          $(data.mainDiv).css({
            cursor: "default"
          });
          if(data.mouseMoveEventHandler != null) {
            if(data.mouseMoveInterval != null) {
              clearInterval(data.mouseMoveInterval);
            }
            data.moveImage(e);
          }
          return true;
        };
        if(data.draggingEnabled) {
          data.mouseUpEvent = $(".mainZoomableImage", mainDiv).mouseup(data.mouseUpFn);
          data.mouseWheelEvent = $(".mainZoomableImage", mainDiv).bind('mousewheel', data.mouseWheelFn);
          data.mouseDownEvent = $(".mainZoomableImage", mainDiv).mousedown(data.mouseDownFn);
        }
        //Add zoom sliders
        var zoomer = $('<div class=zoomer></div>');
        data.zoomer = zoomer;
        zoomer.appendTo($(this));
        zoomer.css({
          position: "absolute"
          ,
          "z-index": 1000
        });
        $(zoomer).slider({
          min: 1
          ,
          orientation: "vertical"
          ,
          max: 10
          ,
          slide: function(event, ui) {
            var coord = {
              x: (data.x / data.currentRatio) * ui.value,
              y: (data.y / data.currentRatio) * ui.value,
              r: ui.value
            };
            data.showCropOnly(coord);
            return true;
          }
        });
        $(zoomer).hide();
        var thmb = $('<div class="thumnailImg"><img class="mainThumbnailImage" src="'+ $("img", mainDiv).attr('src') + '" alt="Thumbnail" ondragstart="return false" onselectstart="return false" /><div class="visibleArea"></div></div>');
        $(thmb).appendTo($(this));
        data.imageRatio = data.actHeight/data.actWidth;
        data.thumbnail = $(thmb);
        data.oldCursor = 'default';
        $(thmb).hover(function(){
          data.oldCursor = $(this).css('cursor')
          $(this).css({
            cursor: 'crosshair'
          })
        }, function() {
          $(this).css({
            cursor: data.oldCursor
          })
        });
        $(thmb).mousedown(function(e){
          var endX = e.pageX - $(this).offset().left;
          var endY = e.pageY - $(this).offset().top;
          var newX = endX / data.thumbWidth * data.imgWidth - data.actWidth / 2;
          var newY = endY / data.thumbHeight * data.imgHeight - data.actHeight / 2;
          var coord = {
            x:  newX,
            y:  newY,
            r: data.currentRatio
          };
          data.showCropOnly(coord);
        });
        $(thmb).css({
          opacity: 0.0
        })
        setTimeout(function(){
          data.thumbWidth = $(thmb).innerWidth();
          data.thumbHeight = data.thumbWidth * data.imageRatio;
          $(thmb).css({
            width: data.thumbWidth
            ,
            height: data.thumbHeight
          });
          $("img", thmb).css({
            width: data.thumbWidth
            ,
            height: data.thumbHeight
          });
          $(".visibleArea", thmb).css({
            width: data.thumbWidth
            ,
            height: data.thumbHeight
          });
          data.showCropOnly({
            x: data.x,
            y: data.y,
            r: data.currentRatio
          });
          $(thmb).css({
            opacity: 1.0
          });
          $(thmb).hide();
          $(mainDiv).hover(function(){
            if(data.mouseMoveEventHandler != null) {
              if(data.mouseMoveInterval != null) {
                clearInterval(data.mouseMoveInterval);
              }
            }
            $(zoomer).show('blind');
            $(thmb).show('blind', 'slow');
          }, function(){
            if(data.mouseMoveEventHandler != null) {
              if(data.mouseMoveInterval != null) {
                clearInterval(data.mouseMoveInterval);
              }
            }
            $(zoomer).hide('blind');
            $(thmb).hide('blind');
            $(data.mainDiv).css({
              cursor: 'default'
            })
          })
        }, 100);
        data.showCropOnly({
          x: data.x
          ,
          y: data.y
          ,
          r: data.currentRatio
          ,
          notAnimate: "true"
        });
      });
    }
    ,
    startDragging: function() {
      return this.each(function() {
        var data = $(this).data('smartZoomer');
        if(!data) {
          $(this).smartZoomer()
          data = $(this).data('smartZoomer');
        }
        $(this).smartZoomer('stopDragging')
        data.draggingEnabled = 1;
        data.mouseUpEvent = $(".mainZoomableImage", data.mainDiv).mouseup(data.mouseUpFn);
        data.mouseWheelEvent = $(".mainZoomableImage", data.mainDiv).bind('mousewheel', data.mouseWheelFn);
        data.mouseDownEvent = $(".mainZoomableImage", data.mainDiv).mousedown(data.mouseDownFn);
      });
    }
    ,
    stopDragging: function() {
      return this.each(function() {
        var data = $(this).data('smartZoomer');
        if(!data) {
          $(this).smartZoomer()
          data = $(this).data('smartZoomer');
        }
        data.draggingEnabled = 0;
        if(data.mouseUpEvent) {
          $(".mainZoomableImage", data.mainDiv).unbind('mouseup', data.mouseUpFn);
          data.mouseUpEvent = null;
        }
        if(data.mouseWheelEvent) {
          $(".mainZoomableImage", data.mainDiv).unbind('mousewheel', data.mouseWheelFn);
          data.mouseWheelEvent = null;
        }
        if(data.mouseDownEvent) {
          $(".mainZoomableImage", data.mainDiv).unbind('mousedown', data.mouseDownFn);
          data.mouseDownEvent = null;
        }
      });
    }
    ,
    zoomIn: function() {
      return this.each(function() {
        var data = $(this).data('smartZoomer');
        if(!data) {
          $(this).smartZoomer()
          data = $(this).data('smartZoomer');
        }
        var nextRatio = data.currentRatio + 1;
        if(nextRatio <= 0) {
          nextRatio = 1;
        }
        else if (nextRatio > 10) {
          nextRatio = 10;
        }
        data.showCropOnly({
          x: data.x
          ,
          y: data.y
          ,
          r: nextRatio
        });
      });
    }
    ,
    zoomOut: function() {
      return this.each(function() {
        var data = $(this).data('smartZoomer');
        if(!data) {
          $(this).smartZoomer()
          data = $(this).data('smartZoomer');
        }
        var nextRatio = data.currentRatio - 1;
        if(nextRatio <= 0) {
          nextRatio = 1;
        }
        else if (nextRatio > 10) {
          nextRatio = 10;
        }
        data.showCropOnly({
          x: data.x
          ,
          y: data.y
          ,
          r: nextRatio
        });
      });
    }
  };

  $.fn.smartZoomer = function(zMethod) {
    // Method calling logic
    if ( zoomerMethods[zMethod] ) {
      return zoomerMethods[ zMethod ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof(zMethod) === 'object' || ! zMethod ) {
      return zoomerMethods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  zMethod + ' does not exist on jQuery.tooltip' );
    }
  };
  return true;
})(jQuery);
