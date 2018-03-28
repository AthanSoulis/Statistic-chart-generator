package gr.uoa.di.madgik.statstool;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import gr.uoa.di.madgik.statstool.mapping.Mapper;
import gr.uoa.di.madgik.statstool.query.Query;

public class MapperTest {

    @Test
    public void testMapper() {
        Mapper mapper = new Mapper();
        mapper.printMapper();
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            Query query = objectMapper.readValue(getClass().getClassLoader().getResource("query_test.json"), Query.class);
            Query mappedQuery = mapper.mapIntermediate(query);
            List<Object> parameters = new ArrayList<>();
            String SqlQuery = mapper.mapGraph(mappedQuery, parameters);
            System.out.println(SqlQuery);
            for(Object obj : parameters) {
                System.out.println(obj);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}