import { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";


const uploadImage = async (buffer: Buffer, userId: string) => {

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		}
	})

	const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
		cloudinary.uploader.upload_stream({ resource_type: "auto" },

			(error, result) => {

				if (error) {
					console.log(error);
					reject(error)
				}

				if (!result) {
					return reject(new Error('Failed to upload in cloudinary'))
				}
				resolve(result)
			}

		).end(buffer)

	})

	const updateUser = await prisma.user.update({
		where: {
			id: userId
		},
		data: {
			image: uploadResult.secure_url,
			imagePublicId: uploadResult.public_id
		},
		omit: {
			password: true
		}
	})

	if (user && user?.imagePublicId) {
		await cloudinary.uploader.destroy(user.imagePublicId)
	}

	return updateUser



};

export const UserService = {
	uploadImage,
};
