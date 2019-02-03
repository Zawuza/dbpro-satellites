CREATE OR REPLACE FUNCTION 
get_raster_by_single_point(latitude double precision, longtitude double precision) 
RETURNS raster
AS 
$$
BEGIN 
  RETURN 
    (select rast FROM berlin where 
	  (latitude between ST_RasterToWorldCoordY(rast,50,50) and ST_RasterToWorldCoordY(rast,1,1)) 
     AND 
    (
      longtitude between ST_RasterToWorldCoordX(rast,1,1) and ST_RasterToWorldCoordX(rast,50,50) 
    ));
    
END;
$$
LANGUAGE 'plpgsql';