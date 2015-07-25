var expect = require('chai').expect;
var StringBuffer = require('..');
var EPS = 1e-5;

describe('StringBuffer class', function () {
  it('should read/write ints of different size in different byte orderings', function () {
    var buf = StringBuffer();
    buf.writeUInt8(5, -1);
    buf.writeUInt16LE(1 << 9, -1);
    buf.writeUInt32LE(1 << 18, -1);
    expect(buf.readUInt8(0)).to.equal(5);
    expect(buf.readUInt16LE(1)).to.equal(1 << 9);
    expect(buf.readUInt32LE(3)).to.equal(1 << 18);
    buf.writeUInt16BE(1 << 9, 0);
    buf.writeUInt32BE(1 << 18, 2);
    expect(buf.readUInt16BE(0)).to.equal(1 << 9);
    expect(buf.readUInt32BE(2)).to.equal(1 << 18);
  });
  it('should read/write floats in different byte orderings', function () {
    var buf = StringBuffer();
    buf.writeFloatLE(0.125, 0);
    expect(buf.readFloatLE(0)).to.equal(0.125);
    buf.writeFloatBE(0.125, 0);
    expect(buf.readFloatBE(0)).to.equal(0.125);
  });
  it('should read/write doubles in different byte orderings', function () {
    var buf = StringBuffer();
    buf.writeDoubleLE(232.2222, 0);
    expect(buf.readDoubleLE(0)).to.equal(232.2222);
    buf.writeDoubleBE(-232.2222, 0);
    expect(buf.readDoubleBE(0)).to.equal(-232.2222);
  });
  it('should understand negative indices', function () {
    var buf = StringBuffer();
    buf.writeUInt8(40, -1);
    buf.writeUInt8(45, -1);
    expect(buf.readUInt8(-1)).to.equal(45);
    expect(buf.readUInt8(-2)).to.equal(40);
  });
  it('should throw on an out of range index', function () {
    var buf = StringBuffer();
    buf.writeUInt8(40, -1);
    buf.writeUInt8(45, -1);
    expect(buf.readUInt8.bind(buf, -3)).to.throw(RangeError);
    expect(buf.readUInt8.bind(buf, 2)).to.throw(RangeError);
    expect(buf.writeUInt8.bind(buf, 40, -4)).to.throw(RangeError);
    expect(buf.writeUInt8.bind(buf, 40, 3)).to.throw(RangeError);
  });
  it('should convert to a typed array and back', function () {
    var buf = StringBuffer();
    buf.writeDoubleLE(232.22, -1);
    buf.writeDoubleLE(190.5, -1);
    var bounce = StringBuffer.fromTypedArray(buf.toTypedArray(Float64Array));
    expect(buf.readDoubleLE(0)).to.equal(232.22);
    expect(buf.readDoubleLE(8)).to.equal(190.5);
  });
});
