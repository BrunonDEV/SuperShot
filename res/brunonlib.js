// COPYRIGHT BRUNON BLOK 2017 (C)
// ALWAYS-USE library with most needed functions
// no such a thing

function Alert(title, content, buttons){
  
  // bootstrap alert box (need html alert section)
  
  $("#alert_title").html(title);
  
  $("#alert_content").html(content);
  
  if(buttons != null){
    $("#alert_plus_buttons").html(buttons);
    
    // BUTTON PRESET
    // <button type="button" class="btn btn-default" onclick="" data-dismiss="modal">TEXT</button>
  }
  else{
    $("#alert_plus_buttons").html("");
  }
  
  $('#alert_modal').modal('show');
}

function closeAlert(){
  $('#alert_modal').modal('hide');
}

function mShow(x){ // modalShow
  $("#" + x).modal("show");
}

function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const api_debug = false;

function API(action, content, type, statement, func, elsefunc){
  // action > for example "getSomething"; content; type > for example "text", "JSON"; statement > for example "[response] === true"; func > function(), elsefunc > function()

  if(type == null)
    type = "text";

  return $.ajax({
    type: "POST",
    url: "API.php",
    data: { action: action, arg: content },
    dataType: type,
    success: function(response){
      if(api_debug)
        console.log(response);
      
      if(statement != null){
        var res = false;
        if(statement != null)
          eval("if('" + response + "' " + statement + "){ res = true; }");
        
        if(res === true){
          if(func != null)
            func(response);
          else{
            if(api_debug)
              console.log("There's no function after statement.");
          }
        }
        else{
          if(elsefunc != null){
            elsefunc();
          }
          if(api_debug)
            console.log("Statement is false. | " + statement);
        }
      }
      else{
        if(func != null)
            func(response);
      }
    },
    error: function(data){
      console.log("ERROR");
      console.log(data);

      if(connection !== false){
        setTimeout(function(){
          console.log("Trying again...");
          API(action, content, type, statement, func, elsefunc);
        }, 250);
      }
    }
  });
}

function cssFile(file){
  var link = document.createElement( "link" );
  link.href = file;
  link.type = "text/css";
  link.rel = "stylesheet";

  document.getElementsByTagName("head")[0].appendChild(link);
}

// not mine

var loadImage = function(src)
{
    var useCanvasCache = true;
    var decodeCanvas;
    var dectodeCtx;
    if (useCanvasCache)
    {
        // Creates a canvas to store the decoded image.
        decodeCanvas = document.createElement('canvas');
        dectodeCtx = decodeCanvas.getContext('2d');
    }
    var image = new Image();
	
    image.onload = function()
    {
        // Simply transfer the image to the canvas to keep the data unencoded in memory.
        if (useCanvasCache)
        {
            decodeCanvas.width = image.width;
            decodeCanvas.height = image.height;
            dectodeCtx.drawImage(image, 0, 0);
        }

    }
    image.src = src;
    // Canvas works the same as an image in a drawImage call, so we can decide which to return.
    if (useCanvasCache)
    {
        return decodeCanvas;
    }
    else
    {
        return image;
    }
};

function rectCircleColl(circle, rect){
    var distX = Math.abs(circle.x - rect.x-rect.w/2);
    var distY = Math.abs(circle.y - rect.y-rect.h/2);

    if (distX > (rect.w/2 + circle.r)) { return false; }
    if (distY > (rect.h/2 + circle.r)) { return false; }

    if (distX <= (rect.w/2)) { return true; } 
    if (distY <= (rect.h/2)) { return true; }

    var dx=distX-rect.w/2;
    var dy=distY-rect.h/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}

Object.size = function(obj) {
    var size = 0;

    $.each(obj, function(key, val){ // key and valueOf
       size++; 
    });
  
    return size;
};

function checkOverflow(el)
{
   var curOverflow = el.style.overflow;

   if ( !curOverflow || curOverflow === "visible" )
      el.style.overflow = "hidden";

   var isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

   el.style.overflow = curOverflow;

   return isOverflowing;
}