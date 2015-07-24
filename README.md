# string-buffer
This is the StringBuffer class that LEON uses internally. It provides all the methods of a Node.js Buffer object, but it stores its data in a string, meaning it is portable enough to be used in the browser as well as on the server.

## Usage
```
var StringBuffer = require('string-buffer');
```
or
```
<script src="string-buffer.js" type="text/javascript"></script>
```
```
var buffer = StringBuffer();
var secondBuffer = StringBuffer();
buffer.writeUInt8(254, 0);
secondBuffer.writeDoubleBE(232.222, 0);
buffer = StringBuffer.concat([ buffer, secondBuffer ]);
buffer
// <StringBuffer fe 40 6d 07 1a 9f be 76 c9>
```
You can also pass negative indices to the methods to indicate you want to read or write that many characters from the end of the line. Passing -1 as an index anywhere where you are reading data (as opposed to writing it) means "the last byte in the buffer." Passing -1 as an index where you are *writing* data signifies "the end of the StringBuffer, no overwriting." The reason this was done is so you can do stuff like this:
```
buffer.clear();
buffer.writeUInt8(5, -1);
buffer.writeUInt8(4, -1);
buffer.readUInt8(-2);
// 5
buffer.readUInt8(-1);
// 4
```
StringBuffer will throw if you attempt to write a number that cannot be stored in that type, such as trying to store a floating point value that requires double precision in a float. To suppress this behavior, you can pass `true` as the third argument to `StringBuffer#writeFloatLE` or what have you. This is consistent with the Node.js API.

If you are using a StringBuffer in the browser, you can convert it to a typed array with `StringBuffer#toTypedArray(bitsPerElement, bigEndian)`. You should pass `true` as the second argument if your data is in big endian format, otherwise the second argument can be omitted. For example if you want a `Uint8Array` and your data is little endian, you can do something like
```
var arr = buffer.toTypedArray(8);
```
You can also convert your buffer directly to a `Blob` object by calling `StringBuffer#toBlob(mimeType, bigEndian)`.

Also, you can create a StringBuffer directly from a `Blob` or `File` object using `StringBuffer.fromBlob(blob, cb)` or `StringBuffer.fromFile(file, cb)`. Both these functions are asynchronous and receive an error object as the first argument to the callback, and the StringBuffer as the second argument.
