/* File for reading the BezierView format */

// trims the string
function trim(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

bvFileParser = function(str){
    this.lines = str.split('\n');
    this.stream = [];
    for(var i = 0; i < this.lines.length; i++){
	var line = trim(this.lines[i]);
	if(line.length == 0)
	    continue;
	var segs = trim(line).split(/\ +/);
	this.stream = this.stream.concat(segs);
    }
    this.currentPos = 0;
}

bvFileParser.prototype = {
    constructor : bvFileParser,

    hasNext : function(){
	return this.currentPos < this.stream.length;
    },

    nextToken : function(){
	var last = this.currentPos;
	this.currentPos++;
	return this.stream[last];
    },

    nextInt : function(){
	return parseInt(this.nextToken());
    },

    nextFloat : function(){
	return parseFloat(this.nextToken());
    },
}

// read function
function read_quad_bezier_from_string(str){
  var x,y,z,w;
  var lines = str.split('\n');
  // console.log(lines);

  var patches = [];

//  for(var i = 1; i < lines.length; i++){
  var i = 0;
  while(i < lines.length){
    var vecs = [];
    var line = trim(lines[i]);

    if(line.length == 0){
      i++;
      continue;
    }

    var segs = trim(lines[i]).split(/\ +/);
    var deg;

    deg = parseInt(segs[1]);

    i++;
    //alert('reading patch of degree' + deg);
    var j = 0;
    while(j < (deg+1)*(deg+1)){
      line = trim(lines[i]);

      if(line.length == 0){
        i++;
        continue;
      }

      var coords = trim(line).split(/\ +/);

      x = parseFloat(coords[0]);
      y = parseFloat(coords[1]);
      z = parseFloat(coords[2]);

      if(coords.length > 3)
        w = parseFloat(coords[3]);
      else
        w = 1.0;
      vecs.push(new THREE.Vector4(x,y,z,w));
      j++;
      i++;
    }
    patches.push([deg,vecs]);
  }
//  console.log(patches);
  return patches;
}

function read_vec3(parser){
    var x,y,z;
    x = parser.nextFloat();
    y = parser.nextFloat();
    z = parser.nextFloat();
    return new THREE.Vector4(x,y,z,1.0);
}

function read_vec4(parser){
    var x,y,z,w;
    x = parser.nextFloat();
    y = parser.nextFloat();
    z = parser.nextFloat();
    w = parser.nextFloat();
    return new THREE.Vector4(x,y,z,w);
}

function read_patches_from_string(str){
    var parser = new bvFileParser(str);

    var patches = [];

    while(parser.hasNext()){
	var type = parser.nextInt();
	switch(type){
	case 4:
	case 5:
	case 8:
	    patches.push(readQuadPatch(type,parser));
	    break;
	default:
	    alert('unsupport format '+ type);
	}
    }
    return patches;
}

function readQuadPatch(type,parser){
    var degu,degv;
    if(type == 4){
	degu = parser.nextInt();
	degv = degu;
    }
    else{
	degu = parser.nextInt();
	degv = parser.nextInt();
    }

    var vecs = [];
    for(var i = 0; i < (degu+1)*(degv+1); i++){
	if(type == 8){
	    vecs.push(read_vec4(parser));
	}
	else{
	    vecs.push(read_vec3(parser));
	}
    }
    return {"type":type,"degu":degu,"degv":degv, "pts":vecs};
}
