(function($) {
  var zoomerMethods = {
    init: function(options) {
      return this.each(function() {
        var data = $(this).data('smartZoomer');
        if(!data) {
          var configOptions = options;
          var actHeight = $(this).innerHeight();
          var actWidth = $(this).innerWidth();
          var mainDiv = this;
          alert($("img", $(mainDiv)).attr('src'))
          var showCropOnly = function(c) {
            if(data.timeout != null) {
              clearTimeout(data.timeout)
            }
            data.timeout = setTimeout(function(){
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
              $("img", $(mainDiv)).css({
                position: "relative"
              });
              $("img", $(mainDiv)).animate({
                top: (-1 * top)+"px"
                ,
                left: (-1 * left)+"px"
                ,
                width: width+"px"
                ,
                height: height+"px"
              });
              clearTimeout(data.timeout);
            }, 10);
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
            currentRatio: 1
            ,
            imgWidth: actWidth
            ,
            imgHeight: actHeight
            ,
            startX: 0
            ,
            startY: 0
            ,
            x: 0
            ,
            y: 0
          });
          data = $(this).data('smartZoomer');
          $(mainDiv).bind('mousewheel', function(event, delta){
            delta = delta || (event.wheelDelta ? event.wheelDelta / 120 : (event.detail) ? -event.detail/3 : 0);
            var nextRatio = (data.currentRatio + ((typeof(delta) == 'undefined' || delta == null) ? 1 : delta));
            if(nextRatio <= 0) {
              nextRatio = 10;
            }
            else if (nextRatio > 10) {
              nextRatio = 1;
            }
            var coord = {
              x: (data.x / data.currentRatio) * nextRatio,
              y: (data.y / data.currentRatio) * nextRatio,
              r: nextRatio
            };
            data.showCropOnly(coord);
            $(zoomer).slider('value', coord.r);
            return true;
          });
          $(mainDiv).mousedown(function(e) {
            $(data.mainDiv).css({
              cursor: "move"
            });
            data.startX = e.pageX - data.mainDiv.offsetLeft;
            data.startY = e.pageY - data.mainDiv.offsetTop;
            data.mouseMoveEventHandler = function(e){
              return true;
            };
            return true;
          });
          $(mainDiv).mouseup(function(e) {
            $(data.mainDiv).css({
              cursor: "default"
            });
            if(data.mouseMoveEventHandler != null) {
              var endX = e.pageX - data.mainDiv.offsetLeft;
              var endY = e.pageY - data.mainDiv.offsetTop;
              var deltaX = (data.startX - endX)
              var deltaY = (data.startY - endY)
              var newX = data.x + deltaX
              var newY = data.y + deltaY
              var coord = {
                x:  newX,
                y:  newY,
                r: data.currentRatio
              };
              data.showCropOnly(coord);
            }
            return true;
          });
          //Add zoom sliders
          var zoomer = $('<div class=zoomer></div>');
          zoomer.appendTo($(this));
          zoomer.css({
            position: "absolute"
            ,
            "z-index": 1000
            ,
            right: "10px"
            ,
            top: "10px"
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
          $(this).hover(function(){
            $(zoomer).show('blind');
          }, function(){
            $(zoomer).hide('blind');
          })
        }
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






















  