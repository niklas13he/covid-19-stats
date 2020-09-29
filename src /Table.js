import React from 'react';
import './Table.css';
import numeral from "numeral";


function Table({ countries }) { // countries skickas in till Table från App 
    return (
        <div className="table">
            {/* add table header with <th> */}
            {countries.map(country => (

                <tr>
                    <td> {country.country} </td>
                    <td>
                        {/* <strong> {country.cases}</strong> */}
                        <strong>{numeral(country.cases).format("0,0")}</strong>

                    </td>
                </tr>
            ))}

        </div>
    )
}

export default Table
