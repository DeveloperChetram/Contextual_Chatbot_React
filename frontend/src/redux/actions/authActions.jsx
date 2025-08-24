import axios from '../../api/axios'
import { registerRequest,registerSuccess, registerFailure } from '../reducers/authSlice'
export const registerUserAction = (data)=>async (dispatch)=>{
    dispatch(registerRequest())
    console.log(data)
    try {
       const result = await  axios.post('/auth/register', data)
       console.log("result from action ", result)
      dispatch( registerSuccess(result))
    } catch (error) {
        dispatch(registerFailure(  error.response?.data?.message || error.message || "Something went wrong"))
        return error;
    }


}