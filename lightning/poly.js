//https://www.npmjs.com/package/bech32 converted for browser
(function() {
    var ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
    
    // pre-compute lookup table
    var ALPHABET_MAP = {}
    for (var z = 0; z < ALPHABET.length; z++) {
      var x = ALPHABET.charAt(z)
    
      if (ALPHABET_MAP[x] !== undefined) throw new TypeError(x + ' is ambiguous')
      ALPHABET_MAP[x] = z
    }
    
    function polymodStep (pre) {
      var b = pre >> 25
      return ((pre & 0x1FFFFFF) << 5) ^
        (-((b >> 0) & 1) & 0x3b6a57b2) ^
        (-((b >> 1) & 1) & 0x26508e6d) ^
        (-((b >> 2) & 1) & 0x1ea119fa) ^
        (-((b >> 3) & 1) & 0x3d4233dd) ^
        (-((b >> 4) & 1) & 0x2a1462b3)
    }
    
    function prefixChk (prefix) {
      var chk = 1
      for (var i = 0; i < prefix.length; ++i) {
        var c = prefix.charCodeAt(i)
        if (c < 33 || c > 126) throw new Error('Invalid prefix (' + prefix + ')')
    
        chk = polymodStep(chk) ^ (c >> 5)
      }
      chk = polymodStep(chk)
    
      for (i = 0; i < prefix.length; ++i) {
        var v = prefix.charCodeAt(i)
        chk = polymodStep(chk) ^ (v & 0x1f)
      }
      return chk
    }
    
    function encode (prefix, words, LIMIT) {
      LIMIT = LIMIT || 90
      if ((prefix.length + 7 + words.length) > LIMIT) throw new TypeError('Exceeds length limit')
    
      prefix = prefix.toLowerCase()
    
      // determine chk mod
      var chk = prefixChk(prefix)
      var result = prefix + '1'
      for (var i = 0; i < words.length; ++i) {
        var x = words[i]
        if ((x >> 5) !== 0) throw new Error('Non 5-bit word')
    
        chk = polymodStep(chk) ^ x
        result += ALPHABET.charAt(x)
      }
    
      for (i = 0; i < 6; ++i) {
        chk = polymodStep(chk)
      }
      chk ^= 1
    
      for (i = 0; i < 6; ++i) {
        var v = (chk >> ((5 - i) * 5)) & 0x1f
        result += ALPHABET.charAt(v)
      }
    
      return result
    }
    
    function decode (str, LIMIT) {
      LIMIT = LIMIT || 90
      if (str.length < 8) throw new TypeError(str + ' too short')
      if (str.length > LIMIT) throw new TypeError('Exceeds length limit')
    
      // don't allow mixed case
      var lowered = str.toLowerCase()
      var uppered = str.toUpperCase()
      if (str !== lowered && str !== uppered) throw new Error('Mixed-case string ' + str)
      str = lowered
    
      var split = str.lastIndexOf('1')
      if (split === -1) throw new Error('No separator character for ' + str)
      if (split === 0) throw new Error('Missing prefix for ' + str)
    
      var prefix = str.slice(0, split)
      var wordChars = str.slice(split + 1)
      if (wordChars.length < 6) throw new Error('Data too short')
    
      var chk = prefixChk(prefix)
      var words = []
      for (var i = 0; i < wordChars.length; ++i) {
        var c = wordChars.charAt(i)
        var v = ALPHABET_MAP[c]
        if (v === undefined) throw new Error('Unknown character ' + c)
        chk = polymodStep(chk) ^ v
    
        // not in the checksum?
        if (i + 6 >= wordChars.length) continue
        words.push(v)
      }
    
      if (chk !== 1) throw new Error('Invalid checksum for ' + str)
      return { prefix: prefix, words: words }
    }
    
    function convert (data, inBits, outBits, pad) {
      var value = 0
      var bits = 0
      var maxV = (1 << outBits) - 1
    
      var result = []
      for (var i = 0; i < data.length; ++i) {
        value = (value << inBits) | data[i]
        bits += inBits
    
        while (bits >= outBits) {
          bits -= outBits
          result.push((value >> bits) & maxV)
        }
      }
    
      if (pad) {
        if (bits > 0) {
          result.push((value << (outBits - bits)) & maxV)
        }
      } else {
        if (bits >= inBits) throw new Error('Excess padding')
        if ((value << (outBits - bits)) & maxV) throw new Error('Non-zero padding')
      }
    
      return result
    }
    
    function toWords (bytes) {
      return convert(bytes, 8, 5, true)
    }
    
    function fromWords (words) {
      return convert(words, 5, 8, false)
    }
    
    window.bech32 = {
      decode: decode,
      encode: encode,
      toWords: toWords,
      fromWords: fromWords
    }
  
    // https://www.npmjs.com/package/utf-8 converted for browser
    window.UTF8 = {
      isNotUTF8: isNotUTF8,
      getCharLength: getCharLength,
      getCharCode: getCharCode,
      getStringFromBytes: getStringFromBytes,
      getBytesForCharCode: getBytesForCharCode,
      setBytesFromCharCode: setBytesFromCharCode,
      setBytesFromString: setBytesFromString,
    };
    
    // non UTF8 encoding detection (cf README file for details)
    function isNotUTF8(bytes, byteOffset, byteLength) {
      try {
        getStringFromBytes(bytes, byteOffset, byteLength, true);
      } catch (e) {
        return true;
      }
      return false;
    }
    
    function getCharLength(theByte) {
      // 4 bytes encoded char (mask 11110000)
      if (0xf0 == (theByte & 0xf0)) {
        return 4;
        // 3 bytes encoded char (mask 11100000)
      } else if (0xe0 == (theByte & 0xe0)) {
        return 3;
        // 2 bytes encoded char (mask 11000000)
      } else if (0xc0 == (theByte & 0xc0)) {
        return 2;
        // 1 bytes encoded char
      } else if (theByte == (theByte & 0x7f)) {
        return 1;
      }
      return 0;
    }
    
    // UTF8 decoding functions
    function getCharCode(bytes, byteOffset, charLength) {
      var charCode = 0,
        mask = '';
      byteOffset = byteOffset || 0;
      // validate that the array has at least one byte in it
      if (bytes.length - byteOffset <= 0) {
        throw new Error('No more characters remaining in array.');
      }
      // Retrieve charLength if not given
      charLength = charLength || getCharLength(bytes[byteOffset]);
      if (charLength == 0) {
        throw new Error(
          bytes[byteOffset].toString(2) +
            ' is not a significative' +
            ' byte (offset:' +
            byteOffset +
            ').'
        );
      }
      // Return byte value if charlength is 1
      if (1 === charLength) {
        return bytes[byteOffset];
      }
      // validate that the array has enough bytes to make up this character
      if (bytes.length - byteOffset < charLength) {
        throw new Error(
          'Expected at least ' + charLength + ' bytes remaining in array.'
        );
      }
      // Test UTF8 integrity
      mask = '00000000'.slice(0, charLength) + 1 + '00000000'.slice(charLength + 1);
      if (bytes[byteOffset] & parseInt(mask, 2)) {
        throw Error(
          'Index ' +
            byteOffset +
            ': A ' +
            charLength +
            ' bytes' +
            ' encoded char' +
            ' cannot encode the ' +
            (charLength + 1) +
            'th rank bit to 1.'
        );
      }
      // Reading the first byte
      mask = '0000'.slice(0, charLength + 1) + '11111111'.slice(charLength + 1);
      charCode += (bytes[byteOffset] & parseInt(mask, 2)) << (--charLength * 6);
      // Reading the next bytes
      while (charLength) {
        if (
          0x80 !== (bytes[byteOffset + 1] & 0x80) ||
          0x40 === (bytes[byteOffset + 1] & 0x40)
        ) {
          throw Error(
            'Index ' +
              (byteOffset + 1) +
              ': Next bytes of encoded char' +
              ' must begin with a "10" bit sequence.'
          );
        }
        charCode += (bytes[++byteOffset] & 0x3f) << (--charLength * 6);
      }
      return charCode;
    }
    
    function getStringFromBytes(bytes, byteOffset, byteLength, strict) {
      var charLength,
        chars = [];
      byteOffset = byteOffset | 0;
      byteLength =
        'number' === typeof byteLength
          ? byteLength
          : bytes.byteLength || bytes.length;
      for (; byteOffset < byteLength; byteOffset++) {
        charLength = getCharLength(bytes[byteOffset]);
        if (byteOffset + charLength > byteLength) {
          if (strict) {
            throw Error(
              'Index ' +
                byteOffset +
                ': Found a ' +
                charLength +
                ' bytes encoded char declaration but only ' +
                (byteLength - byteOffset) +
                ' bytes are available.'
            );
          }
        } else {
          chars.push(
            String.fromCodePoint(getCharCode(bytes, byteOffset, charLength, strict))
          );
        }
        byteOffset += charLength - 1;
      }
      return chars.join('');
    }
    
    // UTF8 encoding functions
    function getBytesForCharCode(charCode) {
      if (charCode < 128) {
        return 1;
      } else if (charCode < 2048) {
        return 2;
      } else if (charCode < 65536) {
        return 3;
      } else if (charCode < 2097152) {
        return 4;
      }
      throw new Error('CharCode ' + charCode + ' cannot be encoded with UTF8.');
    }
    
    function setBytesFromCharCode(charCode, bytes, byteOffset, neededBytes) {
      charCode = charCode | 0;
      bytes = bytes || [];
      byteOffset = byteOffset | 0;
      neededBytes = neededBytes || getBytesForCharCode(charCode);
      // Setting the charCode as it to bytes if the byte length is 1
      if (1 == neededBytes) {
        bytes[byteOffset] = charCode;
      } else {
        // Computing the first byte
        bytes[byteOffset++] =
          (parseInt('1111'.slice(0, neededBytes), 2) << (8 - neededBytes)) +
          (charCode >>> (--neededBytes * 6));
        // Computing next bytes
        for (; neededBytes > 0; ) {
          bytes[byteOffset++] = ((charCode >>> (--neededBytes * 6)) & 0x3f) | 0x80;
        }
      }
      return bytes;
    }
    
    function setBytesFromString(string, bytes, byteOffset, byteLength, strict) {
      string = string || '';
      bytes = bytes || [];
      byteOffset = byteOffset | 0;
      byteLength =
        'number' === typeof byteLength ? byteLength : bytes.byteLength || Infinity;
      for (var i = 0, j = string.length; i < j; i++) {
        var neededBytes = getBytesForCharCode(string[i].codePointAt(0));
        if (strict && byteOffset + neededBytes > byteLength) {
          throw new Error(
            'Not enought bytes to encode the char "' +
              string[i] +
              '" at the offset "' +
              byteOffset +
              '".'
          );
        }
        setBytesFromCharCode(
          string[i].codePointAt(0),
          bytes,
          byteOffset,
          neededBytes,
          strict
        );
        byteOffset += neededBytes;
      }
      return bytes;
    }
  })()
    