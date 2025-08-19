//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Order By Most places in a place
export async function sortByMostDetailed(trips) {
    try {
        //Sort by likes
        let sorted = [...trips];
        sorted.sort((a, b) => {
            const aplaceslength = Array.isArray(a.places) ? a.places.length : 0;
            const bplaceslength = Array.isArray(b.places) ? b.places.length : 0;
            return bplaceslength - aplaceslength;
        });
        return sorted;
    }
    //Catch the error
    catch (err) {
        console.error('Error sorting most detailed trips: ', err);
        throw new Error('Error sorting the trips');
    }
};
//Order By Most Liked trips 
export async function sortByLikes(trips) {
    try {
        //Sort by likes
        let sorted = [...trips];
        sorted.sort((a, b) => b.likes.length - a.likes.length);
        return sorted;
    }
    //Catch the error
    catch (err) {
        console.error('Error sorting most detailed trips: ', err);
        throw new Error('Error sorting the trips');
    }
};
//Order By Newest trips 
export async function sortByNewest(trips) {
    try {
        //Sort by likes
        let sorted = [...trips];
        sorted = trips.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        return sorted;
    }
    //Catch the error
    catch (err) {
        console.error('Error sorting most detailed trips: ', err);
        throw new Error('Error sorting the trips');
    }
}
export function showTrips(sorted, order, setInfoMessage, setMaxPages, setNext, setPrevious, setTripsSliced, changeFilter, sort, navPage, url, type) {
    //Substract one (in case there are a multiple of six don't add one), split by 6 to get number of pages and then add 1
    const max = Math.floor((sorted.length - 1) / 6) + 1;
    setMaxPages(max);
    //If there is no trips show a message and return
    if (sorted.length === 0) {
        if (type === 'mine')
            setInfoMessage("Looks like you don't have trips yet");
        else if (type === 'users')
            setInfoMessage("Looks like there are no users yet");
        else if (type === 'users-search')
            setInfoMessage("No users match your criteria");
        else if (type === 'traveler')
            setInfoMessage("Looks like this traveler don't have trips yet");
        else if (type === 'followed')
            setInfoMessage("The travelers you follow haven't posted anything yet");
        else
            setInfoMessage('No trips match your criteria');
        setNext(false);
        setPrevious(false);
        setTripsSliced([]);
        return;
    }
    setInfoMessage('');
    let sliced = [];
    //When there is a change in the sorting or filter set page to 1
    if (order !== sort || navPage === 1 || changeFilter) {
        //Save the 6 first trips
        sliced = sorted.slice(0, 6)
        //There will not be previous
        setPrevious(false)
        //If max pages greateher than 1 set next 
        if (max > 1)
            setNext(true);
        else
            setNext(false);
        //Save in the url
        url.searchParams.set('page', 1);
    }
    //If there is a reload or a back
    else {
        //Save the next 6 first trips
        sliced = sorted.slice((navPage - 1) * 6, navPage * 6);
        if (navPage != 1)
            setPrevious(true);
        else
            setPrevious(false);
        //If max pages greateher than navPage set next 
        if (max > navPage)
            setNext(true);
        else
            setNext(false);
    }
    setTripsSliced(sliced);
    //Save params in the url
    if (order === 'all-users' || order === 'followed') {
        url.searchParams.set('filter', order);
        window.history.pushState(null, '', url.toString());
        return
    }
    url.searchParams.set('sort', order);
    window.history.pushState(null, '', url.toString());
}
//Go to next page
export function nextPage(navPage, maxPages, setNext, setPrevious, tripsSorted, setTripsSliced, url) {
    if (navPage <= maxPages) {
        //Save the start of the pages
        const start = navPage * 6;
        //Save the trips sliced (Will be shown)
        const sliced = tripsSorted.slice(start, start + 6);
        setTripsSliced(sliced);
        //If next page is greater or equal than maxPages next will be false
        if (navPage + 1 >= maxPages)
            setNext(false);
        //If actual page is 1 previous will be true
        if (navPage === 1)
            setPrevious(true);
        //Go to the top of the trips
        setTimeout(() => {
            document.getElementById('trip-places').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100)
        //Update page in the url
        url.searchParams.set('page', navPage + 1);
        window.history.pushState(null, '', url.toString());
    }
}
//Go to previous page
export function previousPage(navPage, maxPages, tripsSorted, setTripsSliced, setPrevious, setNext, url) {
    if (navPage >= 1) {
        //Save the start of the pages
        const end = (navPage - 1) * 6;
        //Save the trips sliced (Will be shown)
        const sliced = tripsSorted.slice(end - 6, end);
        setTripsSliced(sliced);
        //If previous page is smaller or equal than 1 previous will be false
        if (navPage - 1 <= 1)
            setPrevious(false);
        //If next page is maxPages next will be true
        if (navPage === maxPages)
            setNext(true);
        //Go to the top of the trips
        setTimeout(() => {
            document.getElementById('trip-places').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100)
        //Update page in the url
        url.searchParams.set('page', navPage - 1);
        window.history.pushState(null, '', url.toString());
    }
}
//Search a trip by name
export async function searchTrip(url, body, setTrips, tripType) {
    try {
        let res;
        //Search trips in saved trips
        if (tripType === 'saved-trips') {
            //fetch the search with the body send it
            res = await fetch(`${backendUrl}/api/users/my-saved-trips/search`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(body)
            })

        }
        //Search trips in travelers followed trips
        else if (tripType === 'followed-trips') {
            //fetch the search with the body send it
            res = await fetch(`${backendUrl}/api/users/followed-trips/search`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(body)
            })
        }
        //Search for all trips
        else {
            //fetch the search with the body send it
            res = await fetch(`${backendUrl}/api/trips/search`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(body)
            })
        }
        //If the result is not ok, send a message
        if (!res.ok) {
            throw new Error('Unexpected Error');
        }
        //Get the json and save the state
        const json = await res.json();
        if (tripType === 'saved-trips')
            setTrips(json.data.saved_trips)
        else
            setTrips(json.data);
        //Save in the url
        if (body.name)
            url.searchParams.set('search-trip', body.name);
        if (body.country)
            url.searchParams.set('search-country', body.country);
        if (body.city)
            url.searchParams.set('search-city', body.city);
        window.history.pushState(null, '', url.toString());
    }
    catch (err) {
        console.error('Error searching a trip: ', err);
        throw new Error('Unexpected Error');
    }
}
//Get Countries
export async function getCountries(setCountries, country) {
    //Fetch the countries
    fetch("https://countriesnow.space/api/v0.1/countries")
        .then((response) => {
            //Throw an error if response is not ok
            if (!response.ok) {
                throw new Error("Error getting the countries");
            }
            //Parse the json body
            return response.json();
        })
        .then((data) => {
            //Set countries with fetched data
            setCountries(data.data);
        })
        .catch((err) => {
            throw new Error("Error getting the countries: ", err);
        })
}
//Get Cities
export async function getCities(selectedCountry, setCities) {
    //Use GET request to fetch country data
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //Specify a json body with the country
        body: JSON.stringify({
            country: selectedCountry
        })
    })
        .then((response) => {
            //Throw an error if response is not ok
            if (!response.ok) {
                throw new Error("Error getting the cities");
            }
            //Parse the json body
            return response.json();
        })
        .then((data) => {
            //Set countries with fetched data
            setCities(data.data);
        })
        .catch((err) => {
            throw new Error("Error getting the cities: ", err);
        })
}