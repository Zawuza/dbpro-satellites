CREATE OR REPLACE FUNCTION 
get_raster_by_coordinates(left_lower_latitude double precision, left_lower_longtitude double precision,
                       right_upper_latitude double precision, right_upper_longtitude double precision) 
RETURNS table(result_rast raster)
AS 
$$
BEGIN
  
  RETURN  QUERY
    (select rast FROM berlin where 
	  (
		  (ST_RasterToWorldCoordY(rast,1,1) between left_lower_latitude and right_upper_latitude) 
		  OR
      (ST_RasterToWorldCoordY(rast,1,50) between left_lower_latitude and right_upper_latitude) 
      OR
      (ST_RasterToWorldCoordY(rast,50,1) between left_lower_latitude and right_upper_latitude) 
      OR
      (ST_RasterToWorldCoordY(rast,50,50) between left_lower_latitude and right_upper_latitude) 
    ) 
  AND 
    (
      (ST_RasterToWorldCoordX(rast,1,1) between left_lower_longtitude and right_upper_longtitude) 
      OR
      (ST_RasterToWorldCoordX(rast,1,50) between left_lower_longtitude and right_upper_longtitude) 
      OR
      (ST_RasterToWorldCoordX(rast,50,1) between left_lower_longtitude and right_upper_longtitude) 
      OR
      (ST_RasterToWorldCoordX(rast,50,50) between left_lower_longtitude and right_upper_longtitude) 
    ));
    
END;
$$
LANGUAGE 'plpgsql';

-- Examples:
-- SELECT get_raster_by_coordinates(52.506671, 13.332583, 52.522570, 13.377324);