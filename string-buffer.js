(function (root) {
  var root = this;
  var SIGNED = 0x01,
      CHAR = 0x00,
      SHORT = 0x02,
      INT = 0x04,
      FLOAT = 0x08,
      DOUBLE = 0x18,
      STRING = 0x20;
  var SIGNED_CHAR = 0x01,
      SIGNED_SHORT = 0x03,
      SIGNED_INT = 0x05;
  function typeCheck(val, type) {
    switch (type) { 
      case SIGNED_CHAR:
        if (val % 1 || val < -(1 << 7) || val >= (1 << 7)) typeError(type);
        break;
      case CHAR:
        if (val % 1 || val < 0 || val >= (1 << 8)) typeError(type);
        break;
      case SIGNED_SHORT:
        if (val % 1 || val < -(1 << 15) || val >= (1 << 15)) typeError(type);
        break;
      case SHORT:
        if (val % 1 || val < 0 || val >= (1 << 16)) typeError(type);
        break;
      case SIGNED_INT:
        if (val % 1 || val < -(Math.pow(2, 31)) || val >= Math.pow(2, 31)) typeError(type);
        break;
      case INT:
        if (val % 1 || val < 0 || val >= Math.pow(2, 32)) typeError(type);
        break;
      case FLOAT:
        var exp, sig = val, log;
        sig = Math.abs(sig);
        log = Math.log(sig)/Math.log(2);
        if (log < 0) {
          log = Math.ceil(log);
        } else {
          log = Math.floor(log);
        }
        exp = 103 + log;
        if (exp < 0 || exp > 255) typeError(type);
        sig *= Math.pow(2, -log + 24);
        if (sig % 1) typeError(type);
        break;
      case DOUBLE:
        break;
      case STRING:
        if (typeof val !== 'string') typeError(type);
        break;
    }
  }
  function typeError(type) {
    throw Error('Type assertion failure, check that your value is actually of type ' + typeToStr(type) + '.');
  }
  function typeToStr(type) {
    if (type === (SIGNED | CHAR)) return "char";
    else if (type === CHAR) return "unsigned char";
    else if (type === (SIGNED | SHORT)) return "short";
    else if (type === SHORT) return "unsigned short";
    else if (type === (SIGNED | INT)) return "int";
    else if (type === INT) return "unsigned int";
    else if (type === FLOAT) return "float";
    else if (type === DOUBLE) return "double";
    else if (type === STRING) return "string";
  }
  function StringBuffer(str) {
    if (!(this instanceof StringBuffer)) return new StringBuffer(str);
    this.buffer = '';
    if (typeof str === 'string') this.write(str, 0);
    else if (Array.isArray(str)) {
      for (var i = 0; i < str.length; ++i) {
        this.writeUInt8(str[i], i);
      }
    } else if (StringBuffer.isStringBuffer(str)) {
      this.buffer = str.buffer;
    }
  }
  StringBuffer.concat = function (arr) {
    return StringBuffer(arr.reduce(function (r, v) {
      return r + v.buffer;
    }, ''));
  };
  StringBuffer.isStringBuffer = function (val) {
    return val instanceof StringBuffer;
  };
  StringBuffer.fromBlob = function (blob, cb) {
    try {
      var ret = StringBuffer();
      var reader = new FileReader();
      reader.addEventListener('loadend', function () {
        var arr = new Uint8Array(reader.result);
        for (var i = 0; i < arr.length; ++i) {
          ret.writeUInt8(arr[i], -1);
        }
        cb(null, ret);
      });
      reader.readAsArrayBuffer(blob);
    } catch (e) {
      cb(e);
    }
  };
  StringBuffer.fromFile = function (file, cb) {
    return StringBuffer.fromBlob(file.slice(), cb);
  };
  StringBuffer.fromBuffer = function (buf) {
    var ret = StringBuffer();
    try {
      if (!Buffer.isBuffer(buf)) throw TypeError('Must pass a buffer.');
      for (var i = 0; i < buf.length; ++i) {
        ret.writeUInt8(buf[i], -1);
      }
      return ret;
    } catch (e) {
      throw ReferenceError('Can only use fromBuffer in a Node.js environment.');
    }
  };
  StringBuffer.fromTypedArray = function (arr, bigEndian) {
    var ret = StringBuffer();
    if (arr instanceof Uint8Array || arr instanceof Uint8ClampedArray) for (var i = 0; i < arr.length; ++i) ret.writeUInt8(arr[i], -1);
    else if (arr instanceof Int8Array) for (var i = 0; i < arr.length; ++i) ret.writeInt8(arr[i], -1);
    else if (arr instanceof Uint16Array) {
      if (bigEndian) {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeUInt16BE(arr[i], -1);
        }
      } else {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeUInt16LE(arr[i], -1);
        }
      }
    } else if (arr instanceof Int16Array) {
      if (bigEndian) {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeInt16BE(arr[i], -1);
        }
      } else {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeInt16LE(arr[i], -1);
        }
      }
    } else if (arr instanceof Uint32Array) {
      if (bigEndian) {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeUInt32BE(arr[i], -1);
        }
      } else {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeUInt32LE(arr[i], -1);
        }
      }
    } else if (arr instanceof Int32Array) {
      if (bigEndian) {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeInt32BE(arr[i], -1);
        }
      } else {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeInt32LE(arr[i], -1);
        }
      }
    } else if (arr instanceof Float32Array) {
      if (bigEndian) {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeFloatBE(arr[i], -1);
        }
      } else {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeFloatLE(arr[i], -1);
        }
      }
    } else if (arr instanceof Float64Array) {
      if (bigEndian) {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeDoubleBE(arr[i], -1);
        }
      } else {
        for (var i = 0; i < arr.length; ++i) {
          ret.writeDoubleLE(arr[i], -1);
        }
      }
    } else throw TypeError('Must supply a typed array.');
    return ret;
  };
  StringBuffer.byteLength = function (str, enc) {
    if (!enc) enc = 'ascii';
    var ret;
    str += '';
    switch (enc) {
      case 'ascii':
      case 'binary':
      case 'raw':
        ret = str.length;
        break;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        ret = str.length * 2;
        break;
      case 'hex':
        ret = str.length >>> 1;
        break;
      default:
        ret = str.length;
    }
    return ret;
  };
  StringBuffer.INSPECT_MAX_BYTES = 50;
  StringBuffer.prototype = {
    writeUInt8: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, CHAR);
      offset = normalize(offset, this.buffer)
      if (offset === this.buffer.length) {
        this.buffer += String.fromCharCode(val);
      } else {
        this.buffer = this.buffer.substr(0, offset) + String.fromCharCode(val) + this.buffer.substr(offset + 1);
      }
      return offset + 1; 
    },
    writeInt8: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SIGNED | CHAR);
      val = (val < 0 ? complement(-val, 8) : val);
      offset = normalize(offset, this.buffer)
      if (offset === this.buffer.length) {
        this.buffer += String.fromCharCode(val);
      } else {
        this.buffer = this.buffer.substr(0, offset) + String.fromCharCode(val) + this.buffer.substr(offset + 1);
      }
      return offset + 1;
    },
    writeUInt16LE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SHORT);
      var bytearr = bytes(val, SHORT), addendum = '';
      forEachRight(bytearr, function (v) {
        addendum += String.fromCharCode(v);
      });
      offset = normalize(offset, this.buffer)
      if (offset >= this.buffer.length || offset === -1) {
        this.buffer += addendum;
      } else {
        this.buffer = this.buffer.substr(0, offset) + addendum + this.buffer.substr(offset + 2);
      }
      return offset + 2;
    },
    writeUInt16BE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SHORT);
      var bytearr = bytes(val, SHORT), addendum = '';
      bytearr.forEach(function (v) {
        addendum += String.fromCharCode(v);
      });
      offset = normalize(offset, this.buffer)
      if (offset >= this.buffer.length || offset === -1) {
        this.buffer += addendum;
      } else {
        this.buffer = this.buffer.substr(0, offset) + addendum + this.buffer.substr(offset + 2);
      }
      return offset + 2;
    },
    writeInt16LE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SIGNED | SHORT);
      val = (val < 0 ? complement(-val, 16) : val);
      if (offset < 0) offset = this.buffer.length - ((offset + 1) % this.buffer.length);
      return this.writeUInt16LE(val, offset);
    },
    writeInt16BE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SIGNED | SHORT);
      val = (val < 0 ? complement(-val, 16) : val);
      if (offset < 0) offset = this.buffer.length - ((offset + 1) % this.buffer.length);
      return this.writeUInt16BE(val, offset);
    },
    writeUInt32LE: function (val, offset, noAssert) {
      val = +val;
      var bytearr = bytes(val, INT), addendum = '';
      if (!noAssert) typeCheck(val, INT);
      forEachRight(bytearr, function (v) {
        addendum += String.fromCharCode(v);
      });
      offset = normalize(offset, this.buffer)
      if (offset === this.buffer.length || offset === -1) {
        this.buffer += addendum;
      } else {
        this.buffer = this.buffer.substr(0, offset) + addendum + this.buffer.substr(offset + 4);
      }
    },
    writeUInt32BE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, INT);
      var bytearr = bytes(val, INT), addendum = '';
      bytearr.forEach(function (v) {
        addendum += String.fromCharCode(v);
      });
      offset = normalize(offset, this.buffer)
      if (offset === this.buffer.length || offset === -1) {
        this.buffer += addendum;
      } else {
        this.buffer = this.buffer.substr(0, offset) + addendum + this.buffer.substr(offset + 4);
      }
    },
    writeInt32LE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SIGNED | INT);
      val = (val < 0 ? complement(-val, 32) : val);
      return this.writeUInt32LE(val, offset);
    },
    writeInt32BE: function (val, offset, noAssert) {
      val = +val;
      if (!noAssert) typeCheck(val, SIGNED | INT);
      val = (val < 0 ? complement(-val, 32) : val);
      return this.writeUInt32BE(val, offset);
    },
    writeFloatLE: function (val, offset, noAssert) {
      if (!noAssert) typeCheck(val, FLOAT);
      var bytearr = bytes(val, FLOAT);
      offset = normalize(offset, this.buffer);
      for (var i = bytearr.length - 1; i >= 0; --i) {
        this.writeUInt8(bytearr[i], offset + (bytearr.length - 1 - i));
      }
      return offset + 4;
    },
    writeFloatBE: function (val, offset, noAssert) {
      if (!noAssert) typeCheck(val, FLOAT);
      var bytearr = bytes(val, FLOAT);
      offset = normalize(offset, this.buffer);
      bytearr.forEach(function (v, i) {
        this.writeUInt8(v, offset + i);
      }, this);
      return offset + 4;
    },
    writeDoubleLE: function (val, offset, noAssert) {
      if (!noAssert) typeCheck(val, DOUBLE);
      var bytearr = bytes(val, DOUBLE);
      offset = normalize(offset, this.buffer);
      for (i = bytearr.length - 1; i >= 0; --i) {
        this.writeUInt8(bytearr[i], offset + (bytearr.length - 1 - i));
      }
      return offset + 8;
    },
    writeDoubleBE: function (val, offset, noAssert) {
      if (!noAssert) typeCheck(val, DOUBLE);
      var bytearr = bytes(val, DOUBLE);
      offset = normalize(offset, this.buffer);
      bytearr.forEach(function (v, i) {
        this.writeUInt8(v, offset + i);
      }, this);
      return offset + 8;
    },
    readUInt8: function (offset) {
      offset = normalize(offset, this.buffer, true);
      return this.buffer.charCodeAt(offset);
    },
    readInt8: function (offset) {
      var val = this.buffer.charCodeAt(offset);
      if (0x80 & val) return -complement(val, 8);
      return val;
    },
    readUInt16LE: function (offset) {
      offset = normalize(offset, this.buffer, true);
      return this.buffer.charCodeAt(offset) | (this.buffer.charCodeAt(offset + 1) << 8);
    },
    readUInt16BE: function (offset) {
      offset = normalize(offset, this.buffer, true);
      return (this.buffer.charCodeAt(offset) << 8) | this.buffer.charCodeAt(offset + 1);
    },
    readInt16LE: function (offset) {
      var val = this.readUInt16LE(offset);
      if (val & 0x8000) return -complement(val, 16);
      return val;
    },
    readInt16BE: function (offset) {
      var val = this.readUInt16BE(offset);
      if (val & 0x8000) return -complement(val, 16);
      return val;
    },
    readUInt32LE: function (offset) {
      offset = normalize(offset, this.buffer, true);
      if (offset < 0) offset = this.buffer.length - ((offset + 1) % this.buffer.length);
      return (this.buffer.charCodeAt(offset) | (this.buffer.charCodeAt(offset + 1) << 8) | (this.buffer.charCodeAt(offset + 2) << 16) | (this.buffer.charCodeAt(offset + 3) << 24));
    },
    readUInt32BE: function (offset) {
      offset = normalize(offset, this.buffer, true);
      return ((this.buffer.charCodeAt(offset) << 24) | (this.buffer.charCodeAt(offset + 1) << 16) | (this.buffer.charCodeAt(offset + 2) << 8) | this.buffer.charCodeAt(offset + 3));
    },
    readInt32LE: function (offset) {
      var val = this.readUInt32LE(offset);
      if (val & 0x80000000) return -complement(val, 32);
      return val;
    },
    readInt32BE: function (offset) {
      var val = this.readUInt32BE(offset);
      if (val & 0x80000000) return -complement(val, 32);
      return val;
    },
    readFloatLE: function (offset) {
      var bytes = [], ret;
      offset = normalize(offset, this.buffer, true);
      for (var i = 0; i < 4; ++i) {
        bytes.push(this.readUInt8(offset + i));
      }
      bytes.reverse();
      return bytesToFloat(bytes);
    },
    readFloatBE: function (offset) {
      var bytes = [], ret;
      offset = normalize(offset, this.buffer, true);
      for (var i = 0; i < 4; ++i) {
        bytes.push(this.readUInt8(offset + i));
      }
      return bytesToFloat(bytes);
    },
    readDoubleLE: function (offset) {
      var bytes = [];
      offset = normalize(offset, this.buffer, true);
      for (var i = 0; i < 8; ++i) {
        bytes.push(this.readUInt8(offset + i));
      }
      bytes.reverse();
      return bytesToDouble(bytes);
    },
    readDoubleBE: function (offset) {
      var bytes = [];
      offset = normalize(offset, this.buffer, true);
      for (var i = 0; i < 8; ++i) {
        bytes.push(this.readUInt8(offset + i));
      }
      return bytesToDouble(bytes);
    },
    fill: function (val, offset, end) {
      if (typeof val === 'string') val = val.charCodeAt(0);
      if (!offset) offset = 0;
      if (!end) end = this.length;
      offset = normalize(offset, this.buffer);
      end = normalize(end, this.buffer);
      var addendum = '';
      for (var i = offset; i < end; ++i) {
        addendum += String.fromCharCode(val);
      }
      this.buffer = this.buffer.substr(0, offset) + addendum + this.buffer.substr(end);
      return this;
    },
    slice: function (start, end) {
      if (!start) start = 0;
      if (!end) end = this.length;
      start = normalize(start, this.buffer, true);
      end = normalize(end, this.buffer, true);
      var ret = StringBuffer();
      ret.buffer = this.buffer.substr(start, end - start);
      return ret;
    },
    copy: function (target, start, sourceStart, sourceEnd) {
      if (!start) start = 0;
      if (!sourceStart) sourceStart = 0;
      if (!sourceEnd) sourceEnd = this.length;
      if (start < 0) start = this.buffer.length - ((start + 1) % this.buffer.length);
      sourceStart = normalize(sourceStart, this.buffer, true);
      sourceEnd = normalize(sourceEnd, this.buffer, true);
      start = normalize(start, this.buffer);
      if (sourceStart < 0) sourceStart = this.buffer.length - ((sourceStart + 1) % this.buffer.length);
      if (sourceEnd < 0) sourceEnd = this.buffer.length - ((sourceEnd + 1) % this.buffer.length);
      target.buffer = target.buffer.substr(0, start) + this.buffer.substr(sourceStart, sourceEnd - sourceStart) + target.buffer.substr(start + sourceEnd - sourceStart);
      return this;
    },
    equals: function (otherBuffer) {
      return this.buffer === otherBuffer.buffer;
    },
    toJSON: function () {
      return JSON.stringify(this.buffer);
    },
    toString: function () {
      return this.buffer;
    },
    write: function (string, offset) {
      offset = normalize(offset, this.buffer);
      for (var i = 0; i < string.length; ++i) {
        this.writeUInt8(string.charCodeAt(i), offset + i);
      }
    },
    inspect: function () {
      return '<StringBuffer ' + (function () {
        var ret = '';
        for (var i = 0; i < StringBuffer.INSPECT_MAX_BYTES && i < this.length; ++i) {
          ret += padLeft(this.readUInt8(i).toString(16)) + (i === StringBuffer.INSPECT_MAX_BYTES - 1 || i === this.length - 1 ? '' : ' ');
        }
        return ret;
      }).call(this) + '>';
    },
    get: function (offset) {
      return this.buffer.charCodeAt(offset);
    },
    clear: function () {
      this.buffer = '';
      return this;
    },
    toTypedArray: function () {
      var type, bigEndian;
      if (typeof arguments[1] === 'boolean') bigEndian = arguments[1];
      else if (typeof arguments[0] === 'boolean') bigEndian = arguments[0];
      else bigEndian = false;
      switch (typeof arguments[0]) {
        case 'function':
          type = arguments[0];
          break;
        case 'undefined':
          type = Uint8Array;
          break;
        default:
          throw TypeError('Must supply a typed array to convert to.');
      }
      switch (type) {
        case Uint8Array:
          var ret = new Uint8Array(this.length);
          for (var i = 0; i < this.length; ++i) {
            ret[i] = this.readUInt8(i);
          }
          return ret;
        case Uint8ClampedArray:
          var ret = new Uint8ClampedArray(this.length);
          for (var i = 0; i < this.length; ++i) {
            ret[i] = this.readUInt8(i);
          }
          return ret;
        case Int8Array:
          var ret = new Int8Array(this.length);
          for (var i = 0; i < this.length; ++i) {
            ret[i] = this.readInt8(i);
          }
          return ret;
        case Uint16Array:
          var ret = new Uint16Array(Math.ceil(this.length / 2));
          if (!bigEndian) {
            for (var i = 0; i < this.length; i += 2) {
              ret[i/2] = this.readUInt16LE(i);
            }
            return ret;
          } else {
            for (var i = 0; i < this.length; i += 2) {
              ret[i/2] = this.readUInt16BE(i);
            }
            return ret;
          }
        case Int16Array:
          var ret = new Int16Array(Math.ceil(this.length / 2));
          if (!bigEndian) {
            for (var i = 0; i < this.length; i += 2) {
              ret[i/2] = this.readInt16LE(i);
            }
            return ret;
          } else {
            for (var i = 0; i < this.length; i += 2) {
              ret[i/2] = this.readInt16BE(i);
            }
            return ret;
          }
        case Uint32Array:
          var ret = new Uint32Array(Math.ceil(this.length / 4));
          if (!bigEndian) {
            for (var i = 0; i < this.length; i += 4) {
              ret[i/4] = this.readUInt32LE(i);
            }
            return ret;
          } else {
            for (var i = 0; i < this.length; i += 4) {
              ret[i/4] = this.readUInt32BE(i);
            }
            return ret;
          }
        case Int32Array:
          var ret = new Int32Array(Math.ceil(this.length / 4));
          if (!bigEndian) {
            for (var i = 0; i < this.length; i += 4) {
              ret[i/4] = this.readInt32LE(i);
            }
            return ret;
          } else {
            for (var i = 0; i < this.length; i += 4) {
              ret[i/4] = this.readInt32BE(i);
            }
            return ret;
          }
        case Float32Array:
          var ret = new Float32Array(Math.ceil(this.length / 4));
          if (!bigEndian) {
            for (var i = 0; i < this.length; i += 4) {
              ret[i/4] = this.readFloatLE(i);
            }
            return ret;
          } else {
            for (var i = 0; i < this.length; i += 4) {
              ret[i/4] = this.readFloatBE(i);
            }
            return ret;
          }
        case Float64Array:
          var ret = new Float64Array(Math.ceil(this.length / 8));
          if (!bigEndian) {
            for (var i = 0; i < this.length; i += 8) {
              ret[i/8] = this.readFloatLE(i);
            }
            return ret;
          } else {
            for (var i = 0; i < this.length; i += 8) {
              ret[i/8] = this.readFloatBE(i);
            }
            return ret;
          }
        default:
          throw TypeError('Must provide a typed array to convert to.');
      }
    },
    toBlob: function (mimeType, bigEndian) {
      if (!mimeType) mimeType = 'application/octet-binary';
      try {
        return new Blob([this.toTypedArray(8, bigEndian)], { type: mimeType 
});
      } catch (e) {
        throw Error('StringBuffer#toBlob only works in the browser.');
      }
    },
    toBuffer: function () {
      var ret, i;
      try {
        ret = new Buffer(this.length);
      } catch (e) {
        throw ReferenceError('Can only use toBuffer in a Node.js environment.');
      }
      for (i = 0; i < this.length; ++i) {
        ret.writeUInt8(this.readUInt8(i), i);
      }
      return ret;
    }
  };
  Object.defineProperty(StringBuffer.prototype, "length", {
    get: function () {
      return this.buffer.length;
    },
    set: function (l) {
      if (l > this.buffer.length) {
        for (var i = l; i < this.buffer.length; ++i) {
          this.buffer += '\0';
        }
      }
      if (l < this.buffer.length) {
        this.buffer = this.buffer.substr(0, l);
      }
    }
  });
  function padLeft(str) {
    var ret = '';
    if (str.length < 2) {
      for (var i = str.length; i < 2; ++i) {
        ret += '0';
      }
    }
    ret += str;
    return ret;
  }
  function bytesToFloat(bytes) {
    var sign = (0x80 & bytes[0]) >>> 7,
        exp = ((bytes[0] & 0x7F) << 1) + ((bytes[1] & 0x80) >>> 7),
        sig = 0;
    bytes[1] &= 0x7F;
    for (i = 0; i <= 2; ++i) {
      sig += (bytes[i + 1] << ((2 - i)*8));
    }
    sig |= 0x800000;
    return shift((sign ? -sig : sig), exp - (127 + 23));
  }
  function bytesToDouble(bytes) {
    var sign = (0x80 & bytes[0]) >>> 7,
        exp = ((bytes[0] & 0x7F) << 4) + ((bytes[1] & 0xF0) >>> 4),
        sig = 0;
    bytes[1] &= 0x0F;
    for (i = 0; i <= 6; ++i) {
      sig += shift(bytes[i + 1], (6 - i)*8);
    }
    sig += 0x10000000000000;
    return shift((sign ? -sig : sig), exp - (1023 + 52));
  }
  function bytes(val, type) {
    var count, ret = [];
    if (type === CHAR) {
      ret.push(val);
      return ret;
    } else if (type === (SIGNED | CHAR)) {
      return (val < 0 ? bytes(complement(-val, 8), CHAR) : bytes(val, CHAR));
    } else if (type === SHORT) {
      ret.push(val >>> 8);
      ret.push(val & 0xFF);
      return ret;
    } else if (type === (SIGNED | SHORT)) {
      return (val < 0 ? bytes(complement(-val, 16), SHORT) : bytes(val, SHORT));
    } else if (type === INT) {
      ret.push((val >>> 24) & 0xFF);
      ret.push((val >>> 16) & 0xFF);
      ret.push((val >>> 8) & 0xFF);
      ret.push(val & 0xFF);
      return ret;
    } else if (type === (SIGNED | INT)) {
      return (val < 0 ? bytes(complement(-val, 32), INT) : bytes(val, INT));
    } else if (type === FLOAT) {
      val = +val;
      var exp = 127, sig = val, sign, log;
      if (sig < 0) sign = 1;
      else sign = 0;
      sig = Math.abs(sig);
      log = Math.log(sig)/Math.log(2);
      if (log > 0) {
        log = Math.floor(log);
      } else {
        log = Math.ceil(log);
      }
      sig *= Math.pow(2, -log + 23);
      exp += log;
      sig = Math.round(sig);
      sig &= 0x7FFFFF;
      ret.push(sign << 7);
      ret[0] += ((exp & 0xFE) >>> 1);
      ret.push((exp & 0x01) << 7);
      ret[1] += ((sig >>> 16) & 0x7F);
      ret.push((sig >>> 8) & 0xFF);
      ret.push(sig & 0xFF);
      return ret;
    } else if (type === DOUBLE) {
      val = +val;
      var exp = 1023, sig = val, sign, log;
      if (sig < 0) sign = 1;
      else sign = 0;
      sig = Math.abs(sig);
      log = Math.log(sig)/Math.log(2);
      if (log > 0) {
        log = Math.floor(log);
      } else {
        log = Math.ceil(log);
      }
      sig *= Math.pow(2, -log + 52);
      exp += log;
      sig = Math.round(sig);
      sig = parseInt(sig.toString(2).substr(1), 2);
      ret.push(sign << 7);
      ret[0] += exp >>> 4;
      ret.push((exp & 0x0F) << 4);
      ret[1] += Math.floor(shift(sig, -48)) & 0x0F;
      var sh = 40;
      for (var i = 0; i < 6; ++i, sh -= 8) {
        ret.push(Math.floor(shift(sig, -sh)) & 0xFF);
      }
      return ret;
    }
  }
  function shift (val, n) {
    return val*Math.pow(2, n);
  }
  function complement(num, bits) {
    if (bits > 31 || !bits) return ~num;
    return (num ^ fill(bits)) + 1;
  }
  function fill(bits) {
    return (1 << bits) - 1;
  }
  function forEachRight(arr, cb, thisArg) {
    for (var i = arr.length - 1; i >= 0; i--) {
      if (cb.apply(thisArg, [ arr[i], i, arr ]) === false) break;
    }
  }
  function normalize (offset, buffer, isRead) {
    var realOffset;
    if (!isRead) isRead = false;
    if (offset < 0 && buffer.length === 0) return 0;
    if (offset < 0) realOffset = buffer.length + +!isRead + offset;
    else realOffset = offset;
    if (realOffset < 0 || realOffset > buffer.length - +isRead) throw RangeError('Tried to ' + (isRead ? 'read' : 'write') + ' at index ' + String(offset) + ' but it is out of range.');
    return realOffset;
  } 
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = StringBuffer;
    }
  } else {
    root.StringBuffer = StringBuffer;
  }
}).call(this);
