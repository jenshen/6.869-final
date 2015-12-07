function [ ] = process_images( path, num_actors, num_images, im_size )    
    % process images
    for i_actors = 1:num_actors
        for i_images = 1:num_images
            im_actor = imread(strcat(path, '/DB/Face_DB/face_', int2str(i_actors - 1), '_', int2str(i_images - 1), '.jpg'));

            face_detector = vision.CascadeObjectDetector();
            face_bbox = step(face_detector, im_actor);

            if size(face_bbox, 1) == 1
                
                side_top = face_bbox(1,2);
                side_btm = face_bbox(1,2) + face_bbox(1,4);
                side_rgt = face_bbox(1,1);
                side_lft = face_bbox(1,1) + face_bbox(1,3);
                
                im_actor = im_actor(side_top:side_btm, side_rgt:side_lft,:);            
                im_actor_size = size(im_actor);
                im_actor = imresize(im_actor, im_size / im_actor_size(1));
                im_actor = rgb2gray(im_actor);
            else
                im_actor = zeros(64);
            end
            imwrite(im_actor, strcat(path, '/DB/Face_DB_Filtered/F', int2str(i_actors - 1), '/face_', int2str(i_actors - 1), '_', int2str(i_images - 1), '.jpg'));
        end
    end
end

