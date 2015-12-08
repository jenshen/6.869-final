function [ ] = process_face_match( path )
    
    filepath = strcat(path, '/Data/data_film.txt');
    data_film = fopen(filepath);
    data_film_framecount = str2num(fgets(data_film));
    data_film_actorcount = str2num(fgets(data_film));
    fclose(data_film);

    NUM_IMAGES_PER_ACTOR = 20;
    IMAGE_SIZE = 64;

    %%%% Taken out during Flight
    process_images(path, data_film_actorcount, NUM_IMAGES_PER_ACTOR, IMAGE_SIZE);

    filepath = strcat(path, '/DB/Face_DB_Filtered');
    faceDB = imageSet(filepath, 'recursive');

    trainingFeatures = zeros(size(faceDB,2)*faceDB(1).Count, 1764);
    featureCount = 1;
    for i=1:size(faceDB,2)
        for j=1:faceDB(i).Count
            trainingFeatures(featureCount,:) = extractHOGFeatures(read(faceDB(i),1));
            trainingLabels{featureCount} = faceDB(i).Description;
            featureCount = featureCount + 1;
        end
        personIndex{i} = faceDB(i).Description;
    end

    faceClassifier = fitcecoc(trainingFeatures, trainingLabels);
    
    filepath = strcat(path, '/Data/data_bboxes.txt');
    data_bbox = fopen(filepath, 'w');
    fprintf(data_bbox, 'parseDataBboxes({');
    for frame_num = 1: data_film_framecount
        [ cnt_actors, ims_actors, bboxes ] = process_stills(strcat(path, '/Video/Frames/frame_', int2str(frame_num), '.png'), IMAGE_SIZE);
        str_frame_num = int2str(frame_num);
        str_cnt_actors = int2str(cnt_actors);
        frame_output_line = strcat('"',str_frame_num, '"', ':"', str_cnt_actors);
        
        if cnt_actors > 0
            % should loop through each found actor in the end
            [ims_actors_height, ims_actors_width] = size(ims_actors);

            for a=1:cnt_actors
                queryImage = ims_actors(1 + ((a - 1) * (ims_actors_height / cnt_actors)):((a - 1) * (ims_actors_height / cnt_actors)) + (ims_actors_height / cnt_actors), :);

                queryFeatures = extractHOGFeatures(queryImage);
                [personLabel, confidence] = predict(faceClassifier, queryFeatures);
                booleanIndex = strcmp(personLabel, personIndex);
                integerIndex = find(booleanIndex);
                
             
                subplot(1,2,1); imshow(queryImage); title('Query Face');
                subplot(1,2,2); imshow(read(faceDB(integerIndex),1));title('Matched Class');
                
                str_integer_index = int2str(integerIndex - 1);
                confidence_actor = -1000 * confidence(integerIndex);
                str_confidence = int2str(confidence_actor);
                
                %bbox stringify
                str_bbox_side_top = num2str(bboxes(a, 1));
                str_bbox_side_btm = num2str(bboxes(a, 2));
                str_bbox_side_lft = num2str(bboxes(a, 3));
                str_bbox_side_rgt = num2str(bboxes(a, 4));
                
                str_bbox_data = strcat(str_bbox_side_top, '*', str_bbox_side_btm, '*', str_bbox_side_lft, '*', str_bbox_side_rgt);
        
                frame_output_line = strcat(frame_output_line, '|', str_integer_index, '*', str_confidence, '*', str_bbox_data);
            end
        end
        frame_output_line = strcat(frame_output_line, '",\n');
        fprintf(data_bbox, frame_output_line);
    end
    fprintf(data_bbox, '});');
    fclose(data_bbox);
end

%TODO:
%update frame range
%check confidence?
%update to include ffmpg in python
%python to call matlab with correct file root
%readd the processing call
