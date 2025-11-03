import mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

interface IUser extends Document {
    login: string;
    password: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    login: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

async function createUser() {
    const login = process.argv[2];
    const password = process.argv[3];

    if (!login || !password) {
        console.error('Usage: yarn create-user <login> <password>');
        console.error('Example: yarn create-user admin mypassword123');
        process.exit(1);
    }

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clicker';

        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');

        // Проверяем, существует ли пользователь
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            console.error(`User with login "${login}" already exists!`);
            process.exit(1);
        }

        // Создаем нового пользователя
        const user = new User({
            login,
            password,
            createdAt: new Date(),
        });

        await user.save();
        console.log(`✅ User "${login}" created successfully!`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error: any) {
        console.error('Error creating user:', error.message);
        if (error.code === 11000) {
            console.error(`User with login "${login}" already exists!`);
        }
        await mongoose.disconnect();
        process.exit(1);
    }
}

createUser();

