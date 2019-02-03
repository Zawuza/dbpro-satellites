--Clip raster
-- SELECT encode(ST_AsPNG(ST_Clip(raster.rast,
			--    ST_GeomFromText('POLYGON((13.349658 52.517236, 13.354741 52.517250, 
							--    13.354836 52.513425, 13.350597 52.512824, 13.349658 52.517236))',4326)
			   	-- ,TRUE)),'hex') FROM
	-- (select rast FROM berlin where 
	-- (52.515565 between ST_RasterToWorldCoordY(rast,50,50) and ST_RasterToWorldCoordY(rast,1,1)) 
 	-- AND 
	-- (13.352308 between ST_RasterToWorldCoordX(rast,1,1) and ST_RasterToWorldCoordX(rast,50,50) )) 
 	-- as raster;

--Get a big raster
-- SELECT encode(ST_AsPNG(ST_Union(result_rast)),'hex')
-- FROM get_raster_by_coordinates(52.506671, 13.332583, 52.522570, 13.377324)

--Final procedure
CREATE OR REPLACE FUNCTION 
    get_unified_raster_by_coordinates(left_lower_latitude double precision, 
        left_lower_longtitude double precision,
        right_upper_latitude double precision, right_upper_longtitude double precision)
RETURNS raster
AS
$$
DECLARE
    polygonstring VARCHAR := 'POLYGON((' + to_char(left_lower_longtitude,'FM0000.999999') + ' ' + 
                                            to_char(left_lower_latitude) + ', ' +
                                            to_char(left_lower_longtitude) + ' ' +
                                            to_char(right_upper_latitude) + ', ' +
                                            to_char(right_upper_longtitude) + ' ' + 
                                            to_char(right_upper_latitude) + ', ' +
                                            to_char(right_upper_longtitude) + ' ' +
                                            to_char(left_lower_latitude) + ', '+
                                            to_char(left_lower_longtitude) + ' ' + 
                                            to_char(left_lower_latitude) + '))';
BEGIN
  RETURN (
      SELECT ST_Union(clipped_rast)
      FROM (
                SELECT ST_Clip(result_rast, ST_GeomFromText(polygonstring ,4326)) as clipped_rast 
                FROM get_raster_by_coordinates(left_lower_latitude, left_lower_longtitude,
                                                right_upper_latitude, right_upper_longtitude)
           ) as clipped_rasts
  );
END;
$$
LANGUAGE 'plpgsql';