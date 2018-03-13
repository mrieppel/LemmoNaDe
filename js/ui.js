function disp(id) {
	var menu_items = ['appm','repm','expm','refm'];
	var menu_contents = ['prbt','appt','rept','expt','reft'];
	var proof_started = cnt.length>0 || gls.length>0;
	for(var i=0;i<menu_items.length;i++) {
		document.getElementById(menu_items[i]).style.backgroundColor = '#DDDDDD';
	}
	for(var i=0;i<menu_contents.length;i++) {
		document.getElementById(menu_contents[i]).style.display='none';
	}
	var show_table = (id=='app' && !proof_started) ? 'prbt' : id+'t';
	document.getElementById(show_table).style.display = 'block';
	document.getElementById(id+'m').style.backgroundColor = 'white';
}

function showSI(id) {
	var d = {rul:'SI1', rulr:'SI2'};
	var el = document.getElementById(id);
	var x = document.getElementById(d[id]);
	if(el.options[el.selectedIndex].value == 'SI/TI') {
		x.style.display = 'block';
	} else {
		x.style.display = 'none';
	}
}

function exp(x) {
	var el = document.getElementById(x);
	var tr = document.getElementById(x+'trigger');
	var dic = {sync:'Syntax', srulc:'Rules for Sentential Logic', qrulc:'Rules for Quantificational Logic'};
	if(el.style.display=='none' || el.style.display=='' ) {
		el.style.display = 'block';
		tr.innerHTML = '[–] '+dic[x];
	} else {
		el.style.display = 'none';
		tr.innerHTML = '[+] '+dic[x];
	}	
}