# Programming Bitcoin

This folder is my adventure going through the [Programming Bitcoin](https://github.com/jimmysong/programmingbitcoin) by Jimmy Song.  This was created by reading the material there and producing the code in javascript to create the library classes and test code to verify results.  It is recommended that you go through the same process in the language of your choice, if javascript, do it yourself and compare here if you like.

* chapter 1 - the code in its current state appears to work, it uses `big-integer` for the `pow` function, but as I progressed through the book I needed to refactor all functions to use it, I will leave the original, it is easier to illustrate with pure javascript numbers.
* chapter 2 - this isues `big-integer` throughout but not really needed to illustrate, all numbers small enoughg, numbers returned as js numbers for easy verification
* chapter 3 - the lack of operator overloads in javascript required a change to the `Point` class to work with `FieldElement` so I created `FieldPoint`, which naturally got refactored later.  The scalar multiplication from this chapter was not very clear, I found what I needed to understand [here](https://hackernoon.com/what-is-the-math-behind-elliptic-curve-cryptography-f61b25253da3) and [this](http://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/) gave me what I needed to do the actual implementation
* chapter 4 - hex != bytes, discoverd this when converting private key starting with zero, legitemately dropped in `bigNum.toString(16)` so need to pad to preserve bytes.  Updated `sec` and `der` also.
* chapter 5 - seems I need chapter 6 to do this?
* chapter 6 - again javascript lack of large number support leads to use of `big-integer`, and seems like node support for streams seems differnt from the python

TODO: remaining chapters