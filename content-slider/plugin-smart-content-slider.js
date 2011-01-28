(function($)
  {
    var methods = {
      init: function(options) {
        return this.each(function() {
          var data = $(this).data('smartContentSlider');
          if(!data) {
            var contents = new Array
            var thumbnails = new Array
            var contentIds = new Array
            var contentIdIndexes = new Array
            var index = 0;
            var currentMainContent = this;
            var configOptions = options;
            var showfx;
            if(options == null || options.showfx == undefined || options.showfx == null) {
              showfx = function(content){
                $(content).hide();
                $(content).show();
              };
            }
            else {
              showfx = options.showfx;
            }
            var hidefx = function(content){
              $(content).hide();
              $(content).remove();
            };
            var showContentForId = function(contentId) {
              // Invoke thumbnail selector before showing
              //TODO
              var clonedContent = $(data.contents[contentId]).clone();
              data.hidefx(data.selectedContentId);
              clonedContent.hide()
              clonedContent.appendTo($(".mainContents", $(data.currentMainContent)));
              data.showfx(clonedContent);
              var oldContentId = data.selectedContentId;
              data.selectedContentId = contentId;
              //Trigger thumbnail showed event
              var newThumbnail = (contentId)?$(data.thumbnails[contentId]):null;
              var oldThumbnail = (oldContentId)?$(data.thumbnails[oldContentId]):null;;
              $(data.currentMainContent).trigger('contentShowed', [clonedContent, newThumbnail, oldThumbnail])
            };
            $(this).data('smartContentSlider', {
              contents: contents
              ,
              thumbnails: thumbnails
              ,
              contentIds: contentIds
              ,
              contentIdIndexes: contentIdIndexes
              ,
              currentMainContent: currentMainContent
              ,
              showContentForId: showContentForId
              ,
              showfx: showfx
              ,
              hidefx: hidefx
              ,
              options: configOptions
            });
            data = $(this).data('smartContentSlider');
          }
          $(".thumbnail", $(data.currentMainContent)).each(function(){
            var href = $('a.contentHref', $(this)).attr('href');
            data.contents[href] = $(href).clone();
            data.thumbnails[href] = this;
            data.contentIdIndexes[href] = index;
            data.contentIds[index++] = href;
            $(this).hover(function(){
              this.style.cursor = 'pointer'
            }, function(){
              this.style.cursor = 'default'
            })
            $(this).click(function(){
              data.showContentForId(href);
              return true;
            });
          });
          $(".mainContents", $(currentMainContent)).html('');
          //First content ID
          data.selectedContentId = null;
          data.showContentForId(contentIds[0]);
        });
      }
      ,
      next: function() {
        return this.each(function() {
          var data = $(this).data('smartContentSlider');
          if(!data) {
            $(this).smartContentSlider()
          }
          var t = data.contentIdIndexes[data.selectedContentId];
          data.showContentForId(data.contentIds[++t < data.contentIds.length ? t : 0]);
        });
      }
      ,
      previous: function() {
        return this.each(function() {
          var data = $(this).data('smartContentSlider');
          if(!data) {
            $(this).smartContentSlider()
          }
          var t = data.contentIdIndexes[data.selectedContentId];
          data.showContentForId(data.contentIds[--t >= 0 ? t : data.contentIds.length - 1]);
        });
      }
      ,
      autoSlide: function(ms, continuing) {
        return this.each(function() {
          var data = $(this).data('smartContentSlider');
          if(!data) {
            $(this).smartContentSlider()
          }
          var self = this;
          var rotate = self._rotate || ( self._rotate = function( e ) {
            clearTimeout( self.rotation );
            self.rotation = setTimeout(function() {
              var t = data.contentIdIndexes[data.selectedContentId];
              data.showContentForId(data.contentIds[++t < data.contentIds.length ? t : 0]);
            }, ms );
			
            if ( e ) {
              e.stopPropagation();
            }
          });
          if(continuing == undefined || continuing == null) {
            continuing = true;
          }
          var stop = self._unrotate || ( self._unrotate = !continuing
            ? function(e) {
              if (e.clientX) { // in case of a true click
                clearTimeout( self.rotation );
              }
            }
            : function( e ) {
              return true;
            });

          // start rotation
          if ( ms ) {
            $(this).bind( "contentShowed", rotate );
            for(var index = 0; index < data.contentIds.length; ++index) {
              $(data.thumbnails[data.contentIds[index]]).bind('click', stop);
            };
            rotate();
          // stop rotation
          } else {
            clearTimeout( self.rotation );
            $(this).unbind( "contentShowed", rotate );
            for(var index = 0; index < data.contentIds.length; ++index) {
              $(data.thumbnails[data.contentIds[index]]).unbind('click', stop);
            }
            delete this._rotate;
            delete this._unrotate;
          }
          return this;
        });
      }
    };
    $.fn.smartContentSlider = function(method) {
      // Method calling logic
      if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
      }
    };
  })(jQuery);