var socket = io.connect(window.location.hostname);

var dostępneBadania = [];
var kartyBadan = [];
var opracowane = [];
var iloscBadańNaRece = 0;
var iloscFunduszy = 0;
var indeksBadanej = 0;
var iloscSkończonychBadań = 0;
var uzyskanePunkty = 0;

function badanie (nazwa, koszt, url){
  this.nazwa = nazwa;
  this.koszt = koszt;
  this.url = url
}

	// TUTAJ TWORZYMY DOSTĘPNE BADANIA

kartyBadan[0] = new badanie("Chrzcielnica", 1000, '<img src="images/chrzielnica.png" alt="Chrzcielnica" />');
kartyBadan[1] = new badanie("Kościół", 3000, '<img src="images/kosciol.png" alt="Kościół" />');
kartyBadan[2] = new badanie("Katedra", 5000, '<img src="images/katedra.png" alt="Katedra" />');

kartyBadan[3] = new badanie("Latarnia morska", 1000, '<img src="images/latarniamorska.png" alt="Latarnia morska" />');
kartyBadan[4] = new badanie("Szpital", 3000, '<img src="images/szpital.png" alt="Szpital" />');
kartyBadan[5] = new badanie("Obserwatorium", 5000, '<img src="images/obserwatorium.png" alt="Obserwatorium" />');

kartyBadan[6] = new badanie("Dwór", 1000, '<img src="images/dwor.png" alt="Dwór" />');
kartyBadan[7] = new badanie("Pałac", 3000, '<img src="images/palac.png" alt="Pałac" />');
kartyBadan[8] = new badanie("Zamek", 5000, '<img src="images/zamek.png" alt="Zamek" />');

kartyBadan[9] = new badanie("Targowisko", 1000, '<img src="images/targowisko.png" alt="Targowisko" />');
kartyBadan[10] = new badanie("Tawerna", 3000, '<img src="images/tawerna.png" alt="Tawerna" />');
kartyBadan[11] = new badanie("Ratusz", 5000, '<img src="images/ratusz.png" alt="Ratusz" />');

kartyBadan[12] = new badanie("Zbrojownia", 1000, '<img src="images/zbrojownia.png" alt="Zbrojownia" />');
kartyBadan[13] = new badanie("Strażnica", 3000, '<img src="images/straznica.png" alt="Strażnica" />');
kartyBadan[14] = new badanie("Forteca", 5000, '<img src="images/forteca.png" alt="Forteca" />');

	// OBSŁUGA WYKONYWANIA RUCHU

$(function(){
    $('#btnReady').attr('disabled', false);
    $('#btnGold').attr('disabled', false);
    $('#btnDis').attr('disabled', false);
    $('#btnBuild').attr('disabled', false);
    $('#btnNotBuild').attr('disabled', false);
    $("#btnReady").click(function(){
      socket.emit('userReady');
      $(this).attr('disabled', true);
      console.log('Jesteś gotowy');
    });
	
  $('#btnGold').click(function(){
    dodajFundusze(2000);
    socket.emit('action', 'Pobierz fundusze');
    $('#btnGold').attr('disabled', true);
    $('#btnDis').attr('disabled', true);
    $('#build').toggle();
    console.log('Uzyskałeś fundusze!');
  });
  $('#btnDis').click(function(){
    losowanieKart(2);
    socket.emit('action', 'Badanie nowych technologii');
    $('#btnGold').attr('disabled', true);
    $('#btnDis').attr('disabled', true);
    $('#build').toggle();
    console.log('Uzyskałeś 2 nowe technologie do opracowania!');
  });
  
  $('#btnBuild').click(function(){
    var taBada;
    doZbadania = prompt('Jaką technologię chcesz opracować ?');
    for(i=0; i<dostępneBadania.length; i++){
      if (doZbadania === dostępneBadania[i].nazwa){
        taBada = dostępneBadania[i];
        indeksBadanej = i;
        break;
      }
    }
    if (taBada){
      if(iloscFunduszy < taBada.koszt){
          alert('Nie posiadasz wystarczającej ilości funduszy przez co tracisz ruch.');
          socket.emit('build', 'Utracił ruch');
      } else {
        kosztBadania = 0-taBada.koszt;
        dodajFundusze(kosztBadania);
        dostępneBadania.splice(indeksBadanej, 1);
        drukujDostępneBadania();
        opracowane[iloscSkończonychBadań] = taBada;
        iloscSkończonychBadań += 1;
        iloscBadańNaRece -=1;
        $('#districts').append(taBada.url);
        socket.emit('build', 'Opracowywanie w toku');
      }
    } else {
      alert('Nie posiadasz wystarczającej ilości funduszy przez co tracisz ruch.');
      socket.emit('build', 'Utracił ruch');
    }
    socket.emit('endofround', iloscSkończonychBadań);
    $('#btnBuild').attr('disabled', true);
    $('#btnNotBuild').attr('disabled', true);
    console.log('BRAWO! Nowa technologia została opracowana i posiadasz już ' + iloscSkończonychBadań + ' opracowanych technologii!');
  });
  $('#btnNotBuild').click(function(){
    socket.emit('build', 'Czekam');
    socket.emit('endofround', iloscSkończonychBadań);
    $('#btnBuild').attr('disabled', true);
    $('#btnNotBuild').attr('disabled', true);
    console.log('Postanowiłeś zrobić przerwę w badaniach.');
  });

});

	// socket connection to server, ask for user's name with an anonmyous callback

socket.on('connect', function() {

	//call the server-side function 'adduser' and send one parameter (value of prompt)
  
  socket.emit('adduser', prompt("Podaj nick"));
});

socket.on('updateinfo', function(data){
  $('#gameInfo').append( data + '</br>').scrollTop(30000000);
});

socket.on('updateusers', function(usednames) {
  $('#users').text('GRACZE:');
  $.each(usednames, function(key, value) {
    $('#users').append('<br/>' + value);
  });
});

socket.on('startgame', function(data){
  $('#action').toggle();
  $('#howMany').toggle();
  losowanieKart(5);
  dodajFundusze(3000);
});

socket.on('newround', function(){
  $('#build').toggle();
  $('#btnGold').attr('disabled', false);
  $('#btnDis').attr('disabled', false);
  $('#btnBuild').attr('disabled', false);
  $('#btnNotBuild').attr('disabled', false);
});

socket.on('endofgame', function(data){
  console.log('KONIEC GRY');
  liczPunkty();
  socket.emit('punkty', uzyskanePunkty);
});

socket.on('zwyciezyl', function(data){
  socket.emit('userReady', alert(data));
});

socket.on('districtinfo', function(data){
  $('#howMany').html('Maksymalna ilość badań: ' + data);
});

	// LOSOWANIE BADAŃ

function losowanieKart(ilosc){
  console.log('BADANIA---');
  console.log(dostępneBadania);
  for (i = iloscBadańNaRece; i<iloscBadańNaRece + ilosc; i++){
    nowaKarta = Math.round((Math.random()*15));
    dostępneBadania[i] = kartyBadan[nowaKarta];
  }
  iloscBadańNaRece = dostępneBadania.length;
  console.log(iloscBadańNaRece);
  drukujDostępneBadania();
  console.log('BADANIA---');
  console.log(dostępneBadania);
  console.log(iloscBadańNaRece);
}

	// DRUKOWANIE BADAŃ

function drukujDostępneBadania(){
  var tekst = "";
  for (i=0; i<dostępneBadania.length; i++){
    tekst += dostępneBadania[i].nazwa + ', Wymagany wkład to: ' + dostępneBadania[i].koszt + ' . <br/>';
  }
  $('#cardsToPlay').html(tekst);
}

	// DODANIE FUNDUSZY

function dodajFundusze(ilosc){
  iloscFunduszy += ilosc;
  $('#details').html('Dostępny budżet: ' + iloscFunduszy + '<br /><br />');
}

	// LICZENIE PKT

function liczPunkty(){
  for (i = 0; i<opracowane.length; i++){
    uzyskanePunkty += opracowane[i].koszt;
  }
  console.log('Ilość uzyskanych punktów badań: ' + uzyskanePunkty);
}