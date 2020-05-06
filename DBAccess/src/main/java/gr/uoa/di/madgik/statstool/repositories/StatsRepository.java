package gr.uoa.di.madgik.statstool.repositories;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import gr.uoa.di.madgik.statstool.domain.Result;

@Repository
public class StatsRepository {

    private final DataSource dataSource;

    private final Logger log = Logger.getLogger(this.getClass());

    public StatsRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Result executeQuery(String query, List<Object> parameters) {
        Result result = new Result();

	Connection connection = null;
        try {
            connection = dataSource.getConnection();

            PreparedStatement st = connection.prepareStatement(query);
            int count = 1;
            for(Object param : parameters) {
                st.setObject(count, param);
                count++;
            }

            ResultSet rs = st.executeQuery();
            int columnCount = rs.getMetaData().getColumnCount();
            while(rs.next()) {
                ArrayList<String> row = new ArrayList<>();
                for(int i = 1; i <= columnCount; i++) {
                    row.add(rs.getString(i));
                }
                result.addRow(row);
            }

            rs.close();
            st.close();
            connection.close();
            return result;
        } catch (Exception e) {
            log.error("Error executing query", e);
            return null;
        } finally {
		try {
			if (connection != null)
				connection.close();
		} catch (Exception e) {
		}
	}
    }

    public String getFullQuery(String query, List<Object> parameters) {
	    StringBuilder sb = new StringBuilder();

        sb.append(query);
        for (Object o : parameters)
            sb.append(';').append(o);

        return sb.toString();
    }

}
