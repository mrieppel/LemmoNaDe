// Premises and Assumptions
function ckPA(d,f,t,r,s,l,n) {
	if(d.length!=1 || d[0]!=(n+1)) {
		throw '[ERROR using Premise/Assumption rule]: Line must depend on itself (line '+(n+1)+') and nothing else.';
	}
	if(l.length>0) {
		throw '[ERROR using Premise/Assumption rule]: These rules can\'t be applied to any lines.';
	}
}

// &I: Conjunction Introduction
function ckCJI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=2) {
		throw flag+'Rule must be applied to two lines.';
	}
	if(t.length!=3 || t[1]!='&') {
		throw flag+'The formula being derived must be a conjunction.';
	}
	if(!(f=='('+frm[l[0]-1]+'&'+frm[l[1]-1]+')') && !(f=='('+frm[l[1]-1]+'&'+frm[l[0]-1]+')')) {
		throw flag+'The formulas on lines '+l[0]+' and '+l[1]+' must be the conjuncts of the formula being derived.';
	}
	var a = sorted(rmDup(dep[l[0]-1].concat(dep[l[1]-1]))).join(',');
	if(d.join(',') != a) {
		throw flag+'dependencies are wrong. Remember: combine the dependencies of the two lines the rule is applied to.';
	}
}

// &E: Conjunction Elimination
function ckCJE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l.join(',')+']: ';
	if(l.length!=1) {
		throw flag+'Rule must be applied to one line.';
	}
	if(tr[l[0]-1].length!=3 || tr[l[0]-1][1]!='&') {
		throw flag+'The formula on line '+l[0]+' must be a conjunction.';
	}
	if(!(f==unparse(tr[l[0]-1][0])) && !(f==unparse(tr[l[0]-1][2]))){
		throw flag+'The formula being derived must be one of the conjuncts of the formula on line '+l[0]+'.';
	}
	var a = dep[l[0]-1].join(',');
	if(d.join(',') != a) {
		throw 'Using &E. dependencies are wrong. Remember: carry down the dependencies of the line the rule is applied to.';
	}
}

// vI: Disjunction Introduction
function ckDJI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l.join(',')+']: ';
	if(l.length!=1) {
		throw flag+'Rule must be applied to one line';
	}
	if(t.length!=3 || t[1]!='v') {
		throw flag+'The formula being derived must be a disjunction.';
	}
	if(!(unparse(t[0])==frm[l[0]-1]) && !(unparse(t[2])==frm[l[0]-1])) {
		throw flag+'The formula on line '+l[0]+' must be a disjunct of the formula being derived.';
	}
	var a = dep[l[0]-1].join(',');
	if(d.join(',')!=a) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}

// vE: Disjunction Elimination
function ckDJE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=5) {
		throw flag+'Rule must be applied to five lines.';
	}
	if(tr[l[0]-1][1]!='v') {
		throw flag+'The first rule line must be the original disjunction.';
	}
	if(rul[l[1]-1]!='Assumption' || rul[l[3]-1]!='Assumption') {
		throw flag+'The second and fourth rule lines must be assumptions.';
	}
	if(frm[l[1]-1]!=unparse(tr[l[0]-1][0])) {
		throw flag+'The second rule line should be the left disjunct of '+frm[l[0]-1]+'.';
	}
	if(frm[l[3]-1]!=unparse(tr[l[0]-1][2])) {
		throw flag+'The fourth rule line should be the right disjunct of '+frm[l[0]-1]+'.';
	}
	if(frm[l[2]-1]!=f || frm[l[4]-1]!=f) {
		throw flag+'The third and fifth rule lines must match the formula being derived.';
	}

	var d1 = dep[l[0]-1].slice(0);
	var d2 = dep[l[2]-1].slice(0);
	var d3 = dep[l[4]-1].slice(0);
	if(d2.indexOf(l[1])>=0) {d2.splice(d2.indexOf(l[1]),1);}
	if(d3.indexOf(l[3])>=0) {d3.splice(d3.indexOf(l[3]),1);}
	
	var a = d1.concat(d2,d3);
	a = rmDup(a);
	a = sorted(a);
	if(d.join(',')!=a.join(',')) {
		throw flag+"dependencies are wrong.  Remember: take the dependencies of each conclusion line, discharging the relevant vE assumption, and then combine that with the dependencies of the original disjunction.";
	}
}

// >I: Conditional Introduction
function ckCNI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=2) {
		throw flag+'Rule must be applied to two lines.';
	}
	if(t.length!=3 || t[1]!='>') {
		throw flag+'The formula being derived must be a conditional.';
	}
	if(rul[l[0]-1]!='Assumption') {
		throw flag+'The first rule line must be an assumption.';
	}
	if(frm[l[0]-1]!=unparse(t[0])) {
		throw flag+'The first rule line must be the antecedent of the conditional being derived.';
	}
	if(frm[l[1]-1]!=unparse(t[2])) {
		throw flag+'The second rule line must be the consequent of the conditional being derived.';
	}
	var a = dep[l[1]-1].slice(0);
	if(a.indexOf(l[0])>=0) {a.splice(a.indexOf(l[0]),1);}
	if(d.join(',')!=a.join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the consequent, and remove the line number of the assumed antecedent.';
	}	
}

// >E: Conditional Elimination
function ckCNE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=2) {
		throw flag+'Rule must be applied to two lines.';
	}
	if(tr[l[0]-1].length!=3 || tr[l[0]-1][1]!='>') {
		throw flag+'The first rule line must be a conditional.'
	}
	if(frm[l[1]-1]!=unparse(tr[l[0]-1][0])) {
		throw flag+'The second rule line must be the antecedent of the conditional on the first rule line.';
	}
	if(f!=unparse(tr[l[0]-1][2])) {
		throw flag+'The formula being derived must be the consequent of the conditional on the first rule line.';
	}
	var tmp = dep[l[0]-1].concat(dep[l[1]-1]);
	var tmp = sorted(rmDup(tmp));
	var a = tmp.join(',');
	if(d.join(',')!=a) {
		throw flag+'dependencies are wrong.  Remember: combine the dependencies of the two lines the rule is applied to.';
	}
}

// ~I: Negation Introduction
function ckNI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=2) {
		throw flag+'Rule must be applied to two lines.';
	}
	if(rul[l[0]-1]!='Assumption') {
		throw flag+'The first rule line must be an assumption.';
	}
	if(tr[l[1]-1].length!=1 || tr[l[1]-1][0]!='#') {
		throw flag+'The second rule line must be the absurdity (i.e. #).';
	}	 
	if(f!=('~'+frm[l[0]-1])) {
		throw flag+'The formula being derived must be the negation of the assumption on the first rule line.';
	}
	var a = dep[l[1]-1].slice(0);
	if(a.indexOf(l[0])>=0) {a.splice(a.indexOf(l[0]),1);}
	if(d.join(',')!=a.join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the absurdity, and remove the line number of the assumption.';
	}	
}

// ~E: Negation Elimination
function ckNE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to lines '+l.join(',')+']: ';
	if(l.length!=2) {
		throw flag+'Rule must be applied to two lines.';
	}
	if(f!='#') {
		throw flag+'Formula being derived must be the absurdity, #.';
	}
	if(frm[l[0]-1]!=('~'+frm[l[1]-1]) && ('~'+frm[l[0]-1])!=frm[l[1]-1]) {
		throw flag+'One of lines '+l[0]+' or '+l[1]+' must be the negation of the other.';
	}
	var tmp = dep[l[0]-1].concat(dep[l[1]-1]);
	tmp = sorted(rmDup(tmp));
	var a = tmp.join(',');
	if(d.join(',')!=a) {
		throw flag+'dependencies are wrong.  Remember: combine the dependencies of the two lines the rule is applied to.';
	}
}

// DN: Double Negation Elimination
function ckDN(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying DN to line '+l.join(',')+']: ';
	if(l.length!=1) {
		throw flag+'Rule must be applied to one line.';
	}
	if(!(frm[l[0]-1].length>=3) || frm[l[0]-1].substr(0,2)!='~~' || f!=frm[l[0]-1].substring(2)) {
		throw flag+'Formula on line '+l[0]+' must be the double negation of the formula being derived.';
	}
	var a = dep[l[0]-1].join(',');
	if(d.join(',')!=a) {
		throw flag+'Dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}


// <>E: Biconditional Introduction
function ckBCI(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l+']: ';
	if(l.length!=2) {
		throw flag+'Rule must be applied to two lines.';
	}
	var t1=tr[l[0]-1]; // the parse tree of the formula on the first rule line
	var t2=tr[l[1]-1]; // the parse tree of the formula on the second rule line
	var x = match(parse('(A>B)'),t1);
	var u = match(parse('(B>A)'),t2);
	var v = match(parse('(A<>B)'),t);
	var w = match(parse('(B<>A)'),t);
	if(!x[0] || !u[0] || !v[0]) {throw flag+'The formulas on lines '+l[0]+' and '+l[1]+' must be conditionals, and the formula being derived must be a biconditional.';}
	if(clash(x[1].concat(u[1]))) {throw flag+'The conditionals on lines '+l[0]+' and '+l[1]+' have to be converses of each other.';}
	if(clash(x[1].concat(v[1])) && clash(x[1].concat(w[1]))) {throw flag+"The biconditional being derived doesn't match the conditionals on lines "+l[0]+' and '+l[1]+'.';}
	var tmp = dep[l[0]-1].concat(dep[l[1]-1]);
	tmp = sorted(rmDup(tmp));
	var a = tmp.join(',');
	if(d.join(',')!=a) {throw flag+'Dependencies are wrong.  Remember: carry down the dependencies of the lines the rule is applied to.';}
}

// <>E: Biconditional Elimination
function ckBCE(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying '+gRul(r)+' to line '+l+']: ';
	if(l.length!=1) {
		throw flag+'Rule must be applied to one line.';
	}
	var tl=tr[l[0]-1]; // the parse tree of the formula on the line the rule is applied to
	var x = match(parse('(A<>B)'),tl);
	var u = match(parse('(A>B)'),t);
	var v = match(parse('(B>A)'),t);
	if(!x[0] || !u[0] || !v[0]) {throw 'The formula on line '+l[0]+' must be a biconditional, and the formula being derived must be a conditional.';}
	if(clash(x[1].concat(u[1])) && clash(x[1].concat(v[1]))) {throw "The conditional being derived doesn't match the biconditional on line "+l[0]+'.';}
	if(d.join(',')!=dep[l[0]-1].join(',')) {
		throw flag+'Dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}

// EFQ: Ex Falso Quodlibet
function ckEFQ(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying EFQ to line '+l.join(',')+']: ';
	if(l.length!=1) {
		throw flag+'Rule must be applied to one line.';
	}
	if(frm[l[0]-1]!='#') {
		throw flag+'Formula on line '+l[0]+' must be the absurdity, \'#\'.';
	}
	if(d.join(',')!=dep[l[0]-1].join(',')) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}

// Df: to and from biconditionals
function ckDf(d,f,t,r,s,l,n) {
	var flag = '[ERROR applying Df to line '+l.join(',')+']: ';
	if(l.length!=1) {
		throw flag+'Rule must be applied to one line.';
	}
	var tl=tr[l[0]-1]; // the parse tree of the formula on the line the rule is applied to
	if(t.length!=3 || tl.length!=3 || !((tl[1]=='<>'&&t[1]=='&') || (tl[1]=='&'&&t[1]=='<>'))) {
		nope();
	}
	if(t[1]=='&') {
		var x = match(parse('(A<>B)'),tl);
		if(!x[0]) {nope();}
		var u = match(parse('((A>B)&(B>A))'),t);
		var v = match(parse('((B>A)&(A>B))'),t);
		if(!u[0] || !v[0]) {nope();}
		if(clash(x[1].concat(u[1])) && clash(x[1].concat(v[1]))) {nope();}
	}
	if(t[1]=='<>') {
		var x = match(parse('((A>B)&(B>A))'),tl);
		if(!x[0]) {nope();}
		var u = match(parse('(A<>B)'),t);
		var v = match(parse('(B<>A)'),t);
		if(!u[0] || !v[0]) {nope();}
		if(clash(x[1].concat(u[1])) && clash(x[1].concat(v[1]))) {nope();}
	}
	function nope() {
		throw flag+'The formula being derived does not follow by Df.';
	}
	var a = dep[l[0]-1].join(',');
	if(d.join(',')!=a) {
		throw flag+'dependencies are wrong.  Remember: carry down the dependencies of the line the rule is applied to.';
	}
}
