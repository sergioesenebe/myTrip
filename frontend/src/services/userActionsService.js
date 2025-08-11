//Get backend url
const backendUrl = import.meta.env.VITE_BACKEND_URL;

//Function to follow a user
export async function followUser(travelerId, followed, usersSliced, setUsersSliced, index) {
    try {
        const res = await fetch(`${backendUrl}/api/users/follow/${travelerId}`, {
            //Select the method, and credentials
            method: 'PUT',
            credentials: 'include'
        })
        //If response is not ok return a message
        if (!res.ok) {
            const json = await res.json();
            throw new Error(res.message);
        }
        if (usersSliced) {
            //Update the users sliced (now will be followed by the user)
            const copy = [...usersSliced];
            copy[index].followed = followed;
            setUsersSliced(copy);
        }
    }
    //If there is an error catch it
    catch (err) {
        console.error('Error following a user: ', err);
        throw new Error(err);
    }
}
//Function to unfollow a user
export async function unfollowUser(travelerId, notFollowedWhite, usersSliced, setUsersSliced, index) {
    try {
        const res = await fetch(`${backendUrl}/api/users/unfollow/${travelerId}`, {
            //Select the method, and credentials
            method: 'DELETE',
            credentials: 'include'
        })
        //If response is not ok return a message
        if (!res.ok) {
            const json = await res.json();
            throw new Error(res.message);
        }
        if (usersSliced) {
            //Update the users sliced (now will be followed by the user)
            const copy = [...usersSliced];
            copy[index].followed = notFollowedWhite;
            setUsersSliced(copy);
        }
    }
    //If there is an error catch it
    catch (err) {
        console.error('Error unfollowing following a user: ', err);
        throw new Error(err);
    }
}