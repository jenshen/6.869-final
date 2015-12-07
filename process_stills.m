function [ cnt_actors, ims_actors, bboxes ] = process_stills( filename, im_size )
    im_still = imread(filename);

    face_detector = vision.CascadeObjectDetector();
    face_bbox = step(face_detector, im_still);

    [face_bbox_rows, face_bbox_cols] = size(face_bbox);
    cnt_actors = face_bbox_rows;
    ims_actors = [];
    bboxes = [];
    for row = 1: face_bbox_rows
    	side_lft = face_bbox(1,2);
        side_rgt = face_bbox(1,2) + face_bbox(1,4);
        side_top = face_bbox(1,1);
        side_btm = face_bbox(1,1) + face_bbox(1,3);
        
        im_still_cropped = im_still(side_lft:side_rgt, side_top:side_btm,:);           
        im_actor_size = size(im_still_cropped);
        im_still_cropped = imresize(im_still_cropped, im_size / im_actor_size(1));
        im_still_cropped = rgb2gray(im_still_cropped);
        ims_actors = [ims_actors;im_still_cropped];
        
        bboxes = [bboxes; side_lft side_rgt side_top side_btm];
    end
    if face_bbox_rows == 0
        im_still_cropped = zeros(64);
        ims_actors = [im_still_cropped];
    end
end

