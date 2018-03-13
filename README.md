LemmoNaDe
=========

This program lets users construct proofs in a Lemmon-style natural deduction system, modeled on the system presented in [Graeme Forbes'](http://spot.colorado.edu/~forbesg/) textbook [Modern Logic](http://www.amazon.com/Modern-Logic-Text-Elementary-Symbolic/dp/0195080297) (OUP 1994).  It offers some of the functionality of the [Mac Logic](http://rd.host.cs.st-andrews.ac.uk/logic/mac/) program, written by Roy Dickoff et. al. at St. Andrews for the Classic Macintosh operating system.  A kit for running Mac Logic under emulation in newer operating systems is available from [Branden Fitelson's](http://fitelson.org/maclogic.htm) website.

You can try out a live version of the program [here](http://mrieppel.github.io/LemmoNaDe/).  Here's a brief description of the content of the various javascript files:

* `js/parsing.js`: code to parse formulas into trees.  Also contains code for transforming formulas in the "plain" notation into formulas containing unicode characters, and formulas in latex.  Internally, the program expects the plain notation, e.g. '>' and '<>', rather than the unicode variants.  Proofs to be imported need to be in the plain notation.

* `js/rules_pl.js`: code implementing rules of propositional logic.

* `js/rules_ql.js`: implementing rules of quantificational logic.

* `js/rules_siti_pl.js`: code implementing the sequent/theorem introduction (SI/TI) rules.  Only covers SI/TI rules for propositional logic; those for quantificational logic are included in `rules_ql.js`.

* `js/ui.js`: code for the user interface, i.e. to dynamically change which menu item ("Construct Proof", "Edit a Line", "Export / Import Proof", and "Reference") the user sees as active.

* `js/userio.js`: code to capture user input (e.g. to append a line, edit a line, import a proof) and generate the appropriate output to the html page.  Also contains the global variables that hold the arrays containing the various parts of each proof line (dependencies, formula, rule lines, rule etc.).

* `js/validate.js`: code to validate the user input, e.g. checking for well-formedness of input formulas, and to dispatch the user input to the appropriate rule checking code.


