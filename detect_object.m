function [bboxes, heatmap] = detect_object(hog_image,hog_filter,topK)
% This function applies the hog_filter
% on the hog_image and returns the topK
% bounding boxes and a coarse heatmap

% Each row of returned "bboxes" contains a detection (bounding box coordinates)
% and the last element of the row is the confidence of detection.
% each row: [xstart ystart xend yend confidence]

if nargin<3
    topK = 1;
end

hmap = fconv(hog_image,{hog_filter},1,1);
A = hmap{1};

bboxes = [];

for i=1:topK
[maxA,ind] = max(A(:));
[y,x] = ind2sub(size(A),ind);
A(ind) = -inf;

x1 = (x-1)*8+1;
y1 = (y-1)*8+1;
x2 = x1+size(hog_filter,2)*8+2*8-1;
y2 = y1+size(hog_filter,1)*8+2*8-1;

bboxes(i,:) = double([x1 y1 x2 y2 maxA/norm(hog_filter(:))]);
end

A = hmap{1};
heatmap = zeros((size(hog_image,1)+2)*8,(size(hog_image,2)+2)*8);
A = imresize(A,[size(A,1)*8 size(A,2)*8]);

x = size(heatmap)/2 - size(A)/2;
heatmap(x(1):x(1)+size(A,1)-1,x(2):x(2)+size(A,2)-1) = A;

heatmap(heatmap<0) = 0;
heatmap = heatmap / max(max(heatmap));

end
