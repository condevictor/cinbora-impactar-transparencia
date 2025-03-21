"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { UploadCloud, Camera, Video } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MediaItem {
	id: string;
	aws_url: string;
}

export default function VisitorGallery() {
	const searchParams = useSearchParams();
	const actionId = searchParams?.get("action_id");
	const [images, setImages] = useState<MediaItem[]>([]);
	const [videos, setVideos] = useState<MediaItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedImage, setExpandedImage] = useState<string | null>(null);

	useEffect(() => {
		if (!actionId) return;
		const fetchImages = async () => {
			try {
				const res = await fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}/files/images`);
				const data = await res.json();
				setImages(data);
			} catch (error) {
				console.error("Error fetching images:", error);
			}
		};
		const fetchVideos = async () => {
			try {
				const res = await fetch(`http://127.0.0.1:3333/ongs/actions/${actionId}/files/videos`);
				const data = await res.json();
				
				const videosArr = data.data ? data.data : (Array.isArray(data) ? data : [data]);
				setVideos(videosArr);
			} catch (error) {
				console.error("Error fetching videos:", error);
			}
		};
		(async () => {
			await Promise.all([fetchImages(), fetchVideos()]);
			setIsLoading(false);
		})();
	}, [actionId]);

	const handleImageClick = (image: MediaItem) => {
		setExpandedImage(image.aws_url);
	};

	return (
		<div className="w-5/6 m-auto mt-8">
            <div className='mb-8'>
                <h1 className='font-bold text-2xl'>Galeria de fotos e vídeos</h1>
                <hr className='my-5 border-black'/>
                <div className='flex items-center mb-8'>
                    <Camera className='text-blue-600 mr-4' size={35}/>
                    <h2 className='text-xl font-bold'>Imagens</h2>
                </div>

                <div className='grid grid-cols-3 gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1'>
                    { !isLoading && (images.length > 0 ? (
                        images.map(image => (
                            <div key={image.id}>
                                <img 
                                    className='w-full h-64 object-cover cursor-pointer'  
                                    src={encodeURI(image.aws_url)} 
                                    alt={`Image ${image.id}`}
                                    onClick={() => handleImageClick(image)}
                                />
                            </div>
                        ))
                    ) : (
                        <p>Nenhuma imagem disponível</p>
                    ))}
                </div>
            </div>

            <div>
                <div className='flex items-center mb-8'>
                    <Video className='text-blue-600 mr-4' size={35}/>
                    <h2 className='text-xl font-bold'>Vídeos</h2>
                </div>
                <div>
                    <div className='grid grid-cols-3 gap-10 mb-20 max-lg:grid-cols-2 max-sm:grid-cols-1'>
                        { !isLoading && (videos.length > 0 ? (
                            videos.map(video => (
                                <div key={video.id}>
                                    <video className='h-64 w-full' src={video.aws_url} controls>
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ))
                        ) : (
                            <p className='mb-8'>Nenhum vídeo disponível</p>
                        ))}
                    </div>
                </div>
            </div>
			<Dialog open={expandedImage !== null} onOpenChange={() => setExpandedImage(null)}>
				<DialogContent className="bg-white rounded-xl shadow-xl p-8 ">
					{expandedImage && (
						<img 
							src={encodeURI(expandedImage)} 
							alt="Imagem Expandida" 
							className="w-full h-auto rounded-lg" 
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
