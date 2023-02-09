var stationRepository = (function () {
    var stationList = [];
    var jsonUrl = 'https://delacorteclock.github.io/LA-Metro-Stations/stationdatabase.json';

    //Get all station objects in an array
    function getAll() {
        return stationList;
    }

    //Push station object into array
    function add(station) {
        stationList.push(station);
    }

    //Add button to info box
    function addListItem(station) {
        var infoList = document.querySelector('.information-box__list');
        var buttonContainer = document.createElement('li');
        buttonContainer.classList.add('group-list-item');
        var button = document.createElement('button');
        button.innerText = station.name;
        button.classList.add('btn');
        button.classList.add('btn-info');
        button.classList.add('information-box__button');
        button.setAttribute('data-toggle', 'modal');
        button.setAttribute('data-target', '#modal-nu');
        buttonContainer.appendChild(button);
        infoList.appendChild(buttonContainer);
        detailLog(button, station);
    }

    //Add event listener to a button with handler function which puts corresponding station's name into showDetails()
    function detailLog(button, station) {
        button.addEventListener('click', function () {
            showDetails(station);
        });
    }

    //Use console.log() for inputted station
    function showDetails(station) {
        loadDetails(station).then(function () {
            console.log(station);
            nuModalTools.openModal(station);
        });
    }

    //Show loading warning message
    function showLoadingMessage() {
        warning = document.querySelector('#loading-box');
        warning.classList.add('showing');
    }

    //Hide loading warning message
    function hideLoadingMessage() {
        warning = document.querySelector('#loading-box');
        warning.classList.remove('showing');
    }

    //Play tone with loading warning message
    function playTone() {
        var t = document.querySelector('#tone');
        t.play();
    }

    //Load list of stations in the railway
    function loadList() {
        showLoadingMessage();
        return fetch(jsonUrl).then(function (result) {
            return result.json();
        }).then(function (json) {
            //Array of info for railway stops
            json.forEach(function (stop) {
                //Each json object literal needs name, id and url generated from line name
                var currentStop = {
                    name: stop.name,
                    id: stop.id,
                    lineUrl: 'https://delacorteclock.github.io/LA-Metro-Stations/lines/' + stop.line.toLowerCase() + '.json'
                };
                add(currentStop);
                console.log(currentStop);
                //Delay loading message to eliminate aesthetically unpleasant 'flashing' 
                setTimeout(hideLoadingMessage, 1500);
            });
        }).catch(function (e) {
            console.error(e);
            setTimeout(hideLoadingMessage, 1500);
        });
    }

    function loadDetails(station) {
        showLoadingMessage();
        playTone();
        var url = station.lineUrl;
        //Use line details exclusively for V0.5
        return fetch(url).then(function (result) {
            return result.json();
        }).then(function (info) {
            //Correction for json format
            info = info[0];
            //Transfer each needed datum
            station.line = info.line;
            station.letter = info.letter;
            station.hex = info.hex;
            station.terminal1 = info.terminal1;
            station.terminal2 = info.terminal2;
            station.weight = info.weight;
            station.logoUrl = info.logoUrl;
            station.infoUrl = info.infoUrl;
            setTimeout(hideLoadingMessage, 500);
        }).catch(function (e) {
            console.error(e);
            setTimeout(hideLoadingMessage, 500);
        });
    }

    return {getAll: getAll, add: add, addListItem: addListItem, loadList: loadList, loadDetails: loadDetails};
})();

//Nu Modal IIFE

var nuModalTools = (function () {
    
    function openModal(station) {
        var modalTitle = document.querySelector('.modal-title');
        modalTitle.innerText = '';
        var modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = '';
        //Different 'paths' depending on whether there are one or two lines at the station selected
        if (station.letter.length === 1) {
            modalTitle.innerHTML = `Line ${station.letter}: <span style='color: ${station.hex}'>${station.line}</span>`;
        } else {
            modalTitle.innerHTML = `Lines ${station.letter}: ${station.line}`;
        }
        //Work for body
        
        //Link logo
        var modalLink = document.createElement('a');
        modalLink.href = station.infoUrl;
        var modalLogo = document.createElement('img');
        modalLogo.src = station.logoUrl;
        modalLogo.id = 'line-img';
        modalLink.appendChild(modalLogo);
        //Info paragraph
        var modalPar = document.createElement('p');
        modalPar.classList.add('station-box__paragraph');
        if (station.letter.length === 1) {
            modalPar.innerText = `You selected ${station.name}: ${station.line} Line station ${station.id}. The ${station.line} (${station.letter}) Line of the LACMTA's Metro Rail system is a ` +  
            ` ${station.weight.toLowerCase()} rail line which runs from ${station.terminal1} to ${station.terminal2}. To learn more about the ${station.line} Line ` + 
            `please click the line logo above this paragraph to visit a LACMTA page where you can access its map and schedule.`;
        } else {
            modalPar.innerText = `You selected ${station.name}: ${station.line} Line station ${station.id}. The ${station.line} (${station.letter}) Lines of the LACMTA's Metro Rail system are ` +  
            ` ${station.weight.toLowerCase()} rail lines in the Los Angeles region. To learn more about the ${station.line} lines ` + 
            `please click the line logo above this paragraph to visit a LACMTA page where you can access a map and schedule for either line.`;
        }
        modalBody.appendChild(modalLink);
        modalBody.appendChild(modalPar);
    }
    
    return {openModal: openModal};
    
})();

//Use getAll to get station information
var trainStops = stationRepository.getAll();
trainStops.forEach(informationLoop);

/***For each object in stationList inform readers about the stopName and railLine and then give the track count. 
 * Also use number of tracks to determine whether the word 'track' should be singular or plural.
 * Call stations with one track miniature***/
function informationLoop(station) {
    stationRepository.addListItem(station);
}

stationRepository.loadList().then(function () {
    stationRepository.getAll().forEach(function (station) {
        stationRepository.addListItem(station);
    });
});