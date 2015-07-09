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
    buf.writeFloatLE(2.2, 0);
    expect(buf.readFloatLE(0)).to.be.within(2.2 - EPS, 2.2 + EPS);
    buf.writeFloatBE(2.2, 0);
    expect(buf.readFloatBE(0)).to.be.within(2.2 - EPS, 2.2 + EPS);
  });
  it('should read/write doubles in different byte orderings', function () {
    var buf = StringBuffer();
    buf.writeDoubleLE(232.2222, 0);
    expect(buf.readDoubleLE(0)).to.equal(232.2222);
    buf.writeDoubleBE(-232.2222, 0);
    expect(buf.readDoubleBE(0)).to.equal(-232.2222);
  });
});
