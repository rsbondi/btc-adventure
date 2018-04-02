# Programming Bitcoin

This folder is my adventure going through the [Programming Bitcoin](https://github.com/jimmysong/programmingbitcoin) by Jimmy Song.  This was created by reading the material there and producing the code in javascript to create the library classes and test code to verify results.  It is recommended that you go through the same process in the language of your choice, if javascript, do it yourself and compare here if you like.

* chapter 1 - the code in its current state appears to work, it uses `big-integer` for the `pow` function, but probably as I progress through the book I will need to refactor all functions to use it, but for now it is easier to illustrate with pure javascript numbers.
* chapter 2 - this isues `big-integer` throughout but not really needed to illustrate, all numbers small enoughg, numbers returned as js numbers for easy verification
* chapter 3 - the lack of operator overloads in javascript required a change to the `Point` class to work with `FieldElement` so I created `FieldPoint`

TODO: remaining chapters