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
        sorted.sort((a, b) => b.likesCount - a.likesCount);
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
export function showTrips(sorted, order, setInfoMessage, setMaxPages, setNext,setPrevious, setTripsSliced, sort, navPage, url, window) {
    //Substract one (in case there are a multiple of six don't add one), split by 6 to get number of pages and then add 1
    const max = Math.floor((sorted.length - 1) / 6) + 1;
    setMaxPages(max);
    //If there is no trips show a message and return
    if (sorted.length === 0) {
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
    url.searchParams.set('sort', order);
    window.history.pushState(null, '', url.toString());
}
