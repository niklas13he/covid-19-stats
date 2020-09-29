import { Card, FormControl, MenuItem, Select, CardContent } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import './App.css';
import { sortData, prettyPrintStat } from './util';
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 33.50756, lng: -41.0096 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [nightmode, setNightmode] = useState(getInitialMode());

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
      .then(respone => respone.json())
      .then(data => {
        setCountryInfo(data);
      })
  })

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));
          const sortedData = sortData(data)
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []); // [] means that we will only run this effect once when the app loads. 


  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = countryCode === 'worldwide' ?
      'https://disease.sh/v3/covid-19/all' :
      `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
      .then(respone => respone.json())
      .then(data => {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
  }
  useEffect(() => {
    localStorage.setItem('dark', JSON.stringify(nightmode));

  }, [nightmode])

  function getInitialMode() {
    const savedMode = JSON.parse(localStorage.getItem("dark"));
    return savedMode || false;
  }

  // function getInitialMode() {
  //   const isReturningUser = "dark" in localStorage;
  //   const savedMode = JSON.parse(localStorage.getItem("dark"));
  //   const userPreferNightmode = getPreferdMode();

  //   if (isReturningUser) {
  //     return savedMode;
  //   } else if (userPreferNightmode) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }
  // function getPreferdMode() {
  //   if (!window.matchMedia) {
  //     return;
  //   }
  //   return window.matchMedia("(prefers-color-scheme: dark)").matches;
  // }

  return (
    // <div className= {nightmode ? : app nightmode : app}>
    <div className={`app ${nightmode && "nightmode"}`}>
      <div className="app__left">
        <div className="app__header">
          <h1 style={{ color: nightmode ? "#f5f6fa" : "black" }}> COVID 19 STATISTICS </h1>

          <div className="toggleContainer">
            <span
              className="symbol__sun"
              style={{ color: nightmode ? "grey" : "black" }}> ☼ </span>
            <span className="toggle">
              <input
                checked={nightmode}
                onChange={() => setNightmode(prevMode => !prevMode)}
                type="checkbox"
                className="checkbox"
                id="checkbox"
              />
              <label htmlFor="checkbox" />
            </span>

            <span
              className="symbol__moon"
              style={{ color: nightmode ? "white" : "grey" }}> ☽ </span>
          </div>


          {/* <NightMode/> */}


          <FormControl className="app__dropdown"
            style={{ backgroundColor: nightmode ? "#194562" : "white" }}>

            <Select variant="outlined" onChange={onCountryChange} value={country}
              style={{ color: nightmode ? "#f5f6fa" : "black" }} >
              <MenuItem value="worldwide"> Worldwide </MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}> {country.name} </MenuItem>
              ))}
            </Select>

          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            nightmode = {nightmode}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={`+${countryInfo.todayDeaths}`}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>

        <Map
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />

      </div>

      <Card className="app__right" >

        <CardContent>
          <h3> Live cases by country </h3>
          <Table countries={tableData} />

          <h3 className='header__graph'> Graph over daily {casesType} </h3>
          <LineGraph className='app__graph' casesType={casesType} />

        </CardContent>
      </Card>


    </div>
  );
}

export default App;
