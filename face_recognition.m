function [x, y] = findActor(frame, actors, images)

    actors={'Ellen Burstyn', 'Matthew McConaughey', 'Mackenzie Foy', 'John Lithgow'};
    images1 = {'http://animalia-life.com/dogs.html', 'https://www.petfinder.com/cats/cat-grooming/', 'http://www.alternativenation.net/wp-content/uploads/2014/11/ellenburstyn.jpg' };
    movie = 'Interstellar';
    frame = 20;

    topConfidence = [];

    for i=1:length(actors)
        for j=1:length(images1)
            %face detection - find the most confident bbox
            search_im = imread(images1(j));
            %extract hog features, and perform detection
            search_im=imresize(search_im,scales(i));
            image_hog = hog(search_im);
            topK = 1;
            [bboxes, heatmap] = detect_object(image_hog,waldo_filter,topK);

        end
    end
end
