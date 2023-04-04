import  express  from "express";

import { login, signup } from "../controllers/auth.js";
import { getAllUsers, updateProfile } from '../controllers/users.js'
import { generateOTP, verifyOTP } from "../controllers/auth.js";
import { registerMail } from "../controllers/mailer.js";
import auth, {localVariables} from "../middlewares/auth.js";

const router = express.Router();

router.post('/signup', signup)
router.post('/login', login)

router.post('/registerMail', registerMail)
router.post('/generateOTP', generateOTP) // generate random OTP
// router.post('/generateOTP',localVariables, generateOTP) // generate random OTP
router.post('/verifyOTP', verifyOTP) // verify generated OTP

router.get('/getAllUsers', getAllUsers)
router.patch('/update/:id', auth, updateProfile)

export default router;