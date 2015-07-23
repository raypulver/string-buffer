(function (root) {
  var root = this;
  var SIGNED = 0x01,
      CHAR = 0x00,
      SHORT = 0x02,
      INT = 0x04,
      FLOAT = 0x06,
      DOUBLE = 0x07,
      STRING = 0x08;
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
    writeUInt8: function (val, offset) {
      val = +val;
      offset = normalize(offset, this.buffer)
      if (offset === this.buffer.length) {
        this.buffer += String.fromCharCode(val);
      } else {
        this.buffer = this.buffer.substr(0, offset) + String.fromCharCode(val) + this.buffer.substr(offset + 1);
      }
      return offset + 1; 
    },
    writeInt8: function (val, offset) {
      val = +val;
      val = (val < 0 ? complement(-val, 8) : val);
      offset = normalize(offset, this.buffer)
      if (offset === this.buffer.length) {
        this.buffer += String.fromCharCode(val);
      } else {
        this.buffer = this.buffer.substr(0, offset) + String.fromCharCode(val) + this.buffer.substr(offset + 1);
      }
      return offset + 1;
    },
    writeUInt16LE: function (val, offset) {
      val = +val;
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
    writeUInt16BE: function (val, offset) {
      val = +val;
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
    writeInt16LE: function (val, offset) {
      val = +val;
      val = (val < 0 ? complement(-val, 16) : val);
      if (offset < 0) offset = this.buffer.length - ((offset + 1) % this.buffer.length);
      return this.writeUInt16LE(val, offset);
    },
    writeInt16BE: function (val, offset) {
      val = +val;
      val = (val < 0 ? complement(-val, 16) : val);
      if (offset < 0) offset = this.buffer.length - ((offset + 1) % this.buffer.length);
      return this.writeUInt16BE(val, offset);
    },
    writeUInt32LE: function (val, offset) {
      val = +val;
      var bytearr = bytes(val, INT), addendum = '';
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
    writeUInt32BE: function (val, offset) {
      val = +val;
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
    writeInt32LE: function (val, offset) {
      val = +val;
      val = (val < 0 ? complement(-val, 32) : val);
      return this.writeUInt32LE(val, offset);
    },
    writeInt32BE: function (val, offset) {
      val = +val;
      val = (val < 0 ? complement(-val, 32) : val);
      return this.writeUInt32BE(val, offset);
    },
    writeFloatLE: function (val, offset) {
      var bytearr = bytes(val, FLOAT);
      offset = normalize(offset, this.buffer);
      for (var i = bytearr.length - 1; i >= 0; --i) {
        this.writeUInt8(bytearr[i], offset + (bytearr.length - 1 - i));
      }
      return offset + 4;
    },
    writeFloatBE: function (val, offset) {
      var bytearr = bytes(val, FLOAT);
      offset = normalize(offset, this.buffer);
      bytearr.forEach(function (v, i) {
        this.writeUInt8(v, offset + i);
      }, this);
      return offset + 4;
    },
    writeDoubleLE: function (val, offset) {
      var bytearr = bytes(val, DOUBLE);
      offset = normalize(offset, this.buffer);
      for (i = bytearr.length - 1; i >= 0; --i) {
        this.writeUInt8(bytearr[i], offset + (bytearr.length - 1 - i));
      }
      return offset + 8;
    },
    writeDoubleBE: function (val, offset) {
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
    toTypedArray: function (bits, bigEndian) {
      if (typeof bits === 'undefined' || bits < 8 || bits > 32 || bits % 8) throw Error('Must specify bit size of typed array to be 8, 16, or 32.');
      if (bits === 8) {
        var ret = new Uint8Array(this.length);
        for (var i = 0; i < this.length; ++i) {
          ret[i] = this.readUInt8(i);
        }
        return ret;
      } else if (bits === 16) {
        var ret = new Uint16Array(Math.ceil(this.length / 2));
        for (var i = 0; i < this.length; i += 2) {
          if (!bigEndian) ret[i] = this.readUInt16LE(i);
          else ret[i] = this.readUInt16BE(i);
        }
        return ret;
      } else {
        var ret = new Uint32Array(Math.ceil(this.length / 4));
        for (var i = 0; i < this.length; i += 4) {
          if (!bigEndian) ret[i] = this.readUInt32LE(i);
          else ret[i] = this.readUInt32BE(i);
        }
        return ret;
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
    var i = 0;
    if (n > 0) {
      while (i < n) {
        val *= 2;
        i++;
      }
    } else {
      n = -n;
      while (i < n) {
        val /= 2;
        i++;
      }
    }
    return val;
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
    if (offset < 0 && buffer.length === 0) return 0;
    if (offset === -1) {
      offset = buffer.length - (isRead ? 1 : 0);
    }
    else if (offset < 0) offset = buffer.length + (isRead ? 0: 1) + (offset % (buffer.length + (isRead ? 0: 1)) );
    return offset;
  } 
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = StringBuffer;
    }
  } else {
    root.StringBuffer = StringBuffer;
  }
}).call(this);
