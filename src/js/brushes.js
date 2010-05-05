// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;


  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();


var BaseBrush = Class.extend({
    init: function(context){
      this.context = context;
      this.prevMouseX = 0;
      this.prevMouseY = 0;
      this.points = [];
      this.count = 0;
    },
  
    strokeStart: function(){},
    stroke: function(){},
    strokeEnd: function(){},
    destroy: function(){}
        
});

var Chrome = BaseBrush.extend({
    init: function(context){
        this._super(context);
        if (RegExp(" AppleWebKit/").test(navigator.userAgent))
            this.context.globalCompositeOperation = 'darker';
    },
    
    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
	{
		var i, dx, dy, d;
		
		this.points.push( [ mouseX, mouseY ] );
		
		this.context.lineWidth = BRUSH_SIZE;
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.1 * BRUSH_PRESSURE + ")";
		this.context.beginPath();
		this.context.moveTo(this.prevMouseX, this.prevMouseY);
		this.context.lineTo(mouseX, mouseY);
		this.context.stroke();

		for (i = 0; i < this.points.length; i++)
		{
			dx = this.points[i][0] - this.points[this.count][0];
			dy = this.points[i][1] - this.points[this.count][1];
			d = dx * dx + dy * dy;

			if (d < 1000)
			{
				this.context.strokeStyle = "rgba(" + Math.floor(Math.random() * COLOR[0]) + ", " + Math.floor(Math.random() * COLOR[1]) + ", " + Math.floor(Math.random() * COLOR[2]) + ", " + 0.1 * BRUSH_PRESSURE + " )";
				this.context.beginPath();
				this.context.moveTo( this.points[this.count][0] + (dx * 0.2), this.points[this.count][1] + (dy * 0.2));
				this.context.lineTo( this.points[i][0] - (dx * 0.2), this.points[i][1] - (dy * 0.2));
				this.context.stroke();
			}
		}

		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;

		this.count ++;

	}    
});

var Circles = BaseBrush.extend({

    init: function(context){
        this._super(context);
        this.context.globalCompositeOperation = 'source-over';
    },

    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
        var i, dx, dy, d, cx, cy, steps, step_delta;

        this.context.lineWidth = BRUSH_SIZE;
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.1 * BRUSH_PRESSURE + ")";  

        dx = mouseX - this.prevMouseX;
        dy = mouseY - this.prevMouseY;
        d = Math.sqrt(dx * dx + dy * dy) * 2;
        
        cx = Math.floor(mouseX / 100) * 100 + 50;
        cy = Math.floor(mouseY / 100) * 100 + 50;
        
        steps = Math.floor( Math.random() * 10 );
        step_delta = d / steps;

        for (i = 0; i < steps; i++)
        {
            this.context.beginPath();
            this.context.arc( cx, cy, (steps - i) * step_delta, 0, Math.PI*2, true);
            this.context.stroke();
        }

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }
});

var Fur = BaseBrush.extend({
    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
        var i, dx, dy, d;

        this.points.push( [ mouseX, mouseY ] );

        this.context.lineWidth = BRUSH_SIZE;
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.1 * BRUSH_PRESSURE + ")";
        
        this.context.beginPath();
        this.context.moveTo(this.prevMouseX, this.prevMouseY);
        this.context.lineTo(mouseX, mouseY);
        this.context.stroke();

        for (i = 0; i < this.points.length; i++)
        {
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;

            if (d < 2000 && Math.random() > d / 2000)
            {
                this.context.beginPath();
                this.context.moveTo( mouseX + (dx * 0.5), mouseY + (dy * 0.5));
                this.context.lineTo( mouseX - (dx * 0.5), mouseY - (dy * 0.5));
                this.context.stroke();
            }
        }

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;

        this.count ++;
    }
});

var Grid = BaseBrush.extend({
    init: function(context){
        this._super(context);
        if (RegExp(" AppleWebKit/").test(navigator.userAgent))
            this.context.globalCompositeOperation = 'darker';
    },

    stroke: function( mouseX, mouseY )
    {
        var i, cx, cy, dx, dy;
        
        cx = Math.round(mouseX / 100) * 100;
        cy = Math.round(mouseY / 100) * 100;
        
        dx = (cx - mouseX) * 10;
        dy = (cy - mouseY) * 10;
        
        this.context.lineWidth = BRUSH_SIZE;        
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.01 * BRUSH_PRESSURE + ")";     

        for (i = 0; i < 50; i++)
        {
            this.context.beginPath();
            this.context.moveTo( cx, cy );
            this.context.quadraticCurveTo(mouseX + Math.random() * dx, mouseY + Math.random() * dy, cx, cy);
            this.context.stroke();
        }
    }
});

var LongFur = BaseBrush.extend({
    init: function(context){
        this._super(context);
        this.context.globalCompositeOperation = 'source-over';        
    },

    stroke: function( mouseX, mouseY )
    {
		var i, size, dx, dy, d;

		this.points.push( [ mouseX, mouseY ] );
		
		this.context.lineWidth = BRUSH_SIZE;		
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.05 * BRUSH_PRESSURE + ")";

		for (i = 0; i < this.points.length; i++)
		{
			size = -Math.random();
			dx = this.points[i][0] - this.points[this.count][0];
			dy = this.points[i][1] - this.points[this.count][1];
			d = dx * dx + dy * dy;

			if (d < 4000 && Math.random() > d / 4000)
			{
				this.context.beginPath();
				this.context.moveTo( this.points[this.count][0] + (dx * size), this.points[this.count][1] + (dy * size));
				this.context.lineTo( this.points[i][0] - (dx * size) + Math.random() * 2, this.points[i][1] - (dy * size) + Math.random() * 2);
				this.context.stroke();
			}
		}
		
		this.count ++;
    }
});

var Ribon = BaseBrush.extend({
    init: function(context){
        this._super(context);

        var scope = this;        
        this.context.globalCompositeOperation = 'source-over';

        this.mouseX = SCREEN_WIDTH / 2;
        this.mouseY = SCREEN_HEIGHT / 2;

        this.painters = [];
        
        for (var i = 0; i < 50; i++)
        {
            this.painters.push({ dx: SCREEN_WIDTH / 2, dy: SCREEN_HEIGHT / 2, ax: 0, ay: 0, div: 0.1, ease: Math.random() * 0.2 + 0.6 });
        }
        
        this.interval = setInterval( update, 1000/60 );
        
        function update()
        {
            var i;
            
            this.context.lineWidth = BRUSH_SIZE;            
            this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.05 * BRUSH_PRESSURE + ")";
            
            for (i = 0; i < scope.painters.length; i++)
            {
                scope.context.beginPath();
                scope.context.moveTo(scope.painters[i].dx, scope.painters[i].dy);       

                scope.painters[i].dx -= scope.painters[i].ax = (scope.painters[i].ax + (scope.painters[i].dx - scope.mouseX) * scope.painters[i].div) * scope.painters[i].ease;
                scope.painters[i].dy -= scope.painters[i].ay = (scope.painters[i].ay + (scope.painters[i].dy - scope.mouseY) * scope.painters[i].div) * scope.painters[i].ease;
                scope.context.lineTo(scope.painters[i].dx, scope.painters[i].dy);
                scope.context.stroke();
            }
        }
    },
    
    destroy: function()
    {
        clearInterval(this.interval);
    },

    strokeStart: function( mouseX, mouseY )
    {
        this.mouseX = mouseX;
        this.mouseY = mouseY

        for (var i = 0; i < this.painters.length; i++)
        {
            this.painters[i].dx = mouseX;
            this.painters[i].dy = mouseY;
        }

        this.shouldDraw = true;
    },

    stroke: function( mouseX, mouseY )
    {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
    }
});

var Shaded = BaseBrush.extend({
    init: function(context){
        this._super(context);

        this.context.globalCompositeOperation = 'source-over';
    },

    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
        var i, dx, dy, d;

        this.points.push( [ mouseX, mouseY ] );
        
        this.context.lineWidth = BRUSH_SIZE;

        for (i = 0; i < this.points.length; i++)
        {
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;

            if (d < 1000)
            {
                this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + ((1 - (d / 1000)) * 0.1 * BRUSH_PRESSURE) + " )";

                this.context.beginPath();
                this.context.moveTo( this.points[this.count][0], this.points[this.count][1]);
                this.context.lineTo( this.points[i][0], this.points[i][1]);
                this.context.stroke();
            }
        }

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;

        this.count ++;
    }
});

var Simple = BaseBrush.extend({
    init: function(context){
        this._super(context);
        this.context.globalCompositeOperation = 'source-over';
    },

    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
        this.context.lineWidth = BRUSH_SIZE;    
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.5 * BRUSH_PRESSURE + ")";
        
        this.context.beginPath();
        this.context.moveTo(this.prevMouseX, this.prevMouseY);
        this.context.lineTo(mouseX, mouseY);
        this.context.stroke();

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    }
});

var Sketchy = BaseBrush.extend({
    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
		var i, dx, dy, d;

		this.points.push( [ mouseX, mouseY ] );

		this.context.lineWidth = BRUSH_SIZE;
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.05 * BRUSH_PRESSURE + ")";

		this.context.beginPath();
		this.context.moveTo(this.prevMouseX, this.prevMouseY);
		this.context.lineTo(mouseX, mouseY);
		this.context.stroke();

		for (i = 0; i < this.points.length; i++)
		{
			dx = this.points[i][0] - this.points[this.count][0];
			dy = this.points[i][1] - this.points[this.count][1];
			d = dx * dx + dy * dy;

			if (d < 4000 && Math.random() > (d / 2000))
			{
				this.context.beginPath();
				this.context.moveTo( this.points[this.count][0] + (dx * 0.3), this.points[this.count][1] + (dy * 0.3));
				this.context.lineTo( this.points[i][0] - (dx * 0.3), this.points[i][1] - (dy * 0.3));
				this.context.stroke();
			}
		}

		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;

		this.count ++;
    }
});

var Squares = BaseBrush.extend({
    init: function(context){
        this._super(context);
        this.context.globalCompositeOperation = 'source-over';
    },

    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
		var dx, dy, angle, px, py;
		
		dx = mouseX - this.prevMouseX;
		dy = mouseY - this.prevMouseY;
		angle = 1.57079633;
		px = Math.cos(angle) * dx - Math.sin(angle) * dy;
		py = Math.sin(angle) * dx + Math.cos(angle) * dy;

		this.context.lineWidth = BRUSH_SIZE;
		this.context.fillStyle = "rgba(" + BACKGROUND_COLOR[0] + ", " + BACKGROUND_COLOR[1] + ", " + BACKGROUND_COLOR[2] + ", " + BRUSH_PRESSURE + ")";
		this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + BRUSH_PRESSURE + ")";
		
		this.context.beginPath();
		this.context.moveTo(this.prevMouseX - px, this.prevMouseY - py);
		this.context.lineTo(this.prevMouseX + px, this.prevMouseY + py);
		this.context.lineTo(mouseX + px, mouseY + py);
		this.context.lineTo(mouseX - px, mouseY - py);
		this.context.lineTo(this.prevMouseX - px, this.prevMouseY - py);
		this.context.fill();
		this.context.stroke();

		this.prevMouseX = mouseX;
		this.prevMouseY = mouseY;
    }
});

var Web = BaseBrush.extend({
    init: function(context){
        this._super(context);
        this.context.globalCompositeOperation = 'source-over';
    },

    strokeStart: function( mouseX, mouseY )
    {
        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;
    },

    stroke: function( mouseX, mouseY )
    {
        var i, dx, dy, d;

        this.points.push( [ mouseX, mouseY ] );

        this.context.lineWidth = BRUSH_SIZE;
        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.5 * BRUSH_PRESSURE + ")";
        this.context.beginPath();
        this.context.moveTo(this.prevMouseX, this.prevMouseY);
        this.context.lineTo(mouseX, mouseY);
        this.context.stroke();

        this.context.strokeStyle = "rgba(" + COLOR[0] + ", " + COLOR[1] + ", " + COLOR[2] + ", " + 0.1 * BRUSH_PRESSURE + ")";

        for (i = 0; i < this.points.length; i++)
        {
            dx = this.points[i][0] - this.points[this.count][0];
            dy = this.points[i][1] - this.points[this.count][1];
            d = dx * dx + dy * dy;

            if (d < 2500 && Math.random() > 0.9)
            {
                this.context.beginPath();
                this.context.moveTo( this.points[this.count][0], this.points[this.count][1]);
                this.context.lineTo( this.points[i][0], this.points[i][1]);
                this.context.stroke();
            }
        }

        this.prevMouseX = mouseX;
        this.prevMouseY = mouseY;

        this.count ++;
    }
});
