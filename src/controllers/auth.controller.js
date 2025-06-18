import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
    try {
        const result = registerValidator.safeParse(req.body);
        if (!result.success) {
            logger.warn('Validation error during registration');
            const errors = {};
            error.issues.forEach((issue) => {
                errors[issue.path.join('.')] = issue.message;
            });
            return res
                .status(400)
                .json(new ApiError(400, 'Validation error', errors));
        }

        const { name, email, password, confirmPassword, gender } = result;

        // Check if password is equal to confirmPassword
        if (password !== confirmPassword) {
            logger.warn(`Password mismatch for email: ${email}`);
            return res
                .status(400)
                .json(new ApiError(400, 'Passwords do not match'));
        }

        // check if the user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            logger.warn(`User already exists: ${email}`);
            return res
                .status(400)
                .json(new ApiError(400, 'User already exists'));
        }

        // hash the passwrod
        const hashedPassword = await bcrypt.hash(password, 10);

        // add random user image
        profilePic = `https://avatar.iran.liara.run/username?username=[${name}]`;
        if (gender && gender === 'male') {
            profilePic = 'https://avatar.iran.liara.run/public/boy';
        } else if (gender && gender === 'female') {
            profilePic = 'https://avatar.iran.liara.run/public/girl';
        }

        // create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image: profilePic,
                gender,
            },
        });

        if (!user) {
            logger.error(`Failed to create user: ${email}`);
            return res
                .status(500)
                .json(new ApiError(500, 'Failed to create user'));
        }

        logger.info(`User registered successfully: ${email}`);
        // remove password from user object
        delete user.password;

        return res
            .status(201)
            .json(new ApiResponse(201, 'User registered successfully', user));
    } catch (error) {
        logger.error('Internal server error during registration');
        return res
            .status(500)
            .json(new ApiError(500, 'Internal server error', error.message));
    }
};
export const login = async (req, res) => {};
export const generateApiKey = async (req, res) => {};
export const getMe = async (req, res) => {};

// Mock req and res
const req = {
    body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        gender: 'male',
    },
};
await register(req, {});
