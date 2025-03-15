import axios from "axios";

// saving the token 
export const saveToken = (token)=>{
  localStorage.setItem("userToken", token)
}
// getting the token 

export const getToken =()=>{
    return localStorage.getItem('userToken')
}

// setting up headers with token 
export const SetAuthHeader = ()=>{
    const token = getToken()
    if(token){
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    else{
        delete axios.defaults.headers.common['Authorization']
    }
}

// remove token on logout 
 export const logout = ()=>{
    localStorage.clear()

    delete axios.defaults.headers.common['Authorization']
 }