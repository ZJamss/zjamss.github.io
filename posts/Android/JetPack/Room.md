### 依赖

```kotlin
    implementation "androidx.room:room-runtime:2.2.6"
    annotationProcessor "androidx.room:room-compiler:2.2.6"
```

### 建议数据库类

```java
@Database(version = 1, entities = {EvaluationRecordDTO.class})
public abstract class DataBase extends RoomDatabase {
    public abstract EvaluationRecordDao evaluationRecordDao();

    private static DataBase instance = null;

    public static synchronized DataBase getInstance(Context context) {
        if (instance != null) {
            return instance;
        }
        instance = Room.databaseBuilder(
                context.getApplicationContext(),
                DataBase.class,
                "eva_db"
        ).build();
        return instance;
    }
}
```

### 建立接口Dao

```java
@Dao
public interface EvaluationRecordDao {
    @Insert
    void insert(EvaluationRecordDTO dto);

    @Query("delete from records where id = :id")
    void deleteById(Integer id);

    @Query("select * from records")
    List<EvaluationRecordDTO> findAll();

    @Query("select * from records where organization = :organization and date = :date")
    EvaluationRecordDTO findOneByDateAndOrganization(String organization,String date);

    @Update
    void update(EvaluationRecordDTO evaluationRecordDTO);
}

```

### 实体类

```java
@Entity(tableName = "records")
public class EvaluationRecordDTO {
    @PrimaryKey(autoGenerate = true)
    private Integer id;
    private String evaluations;  //单评价列表转换后的json
    private String organization;
    private String date;

    public EvaluationRecordDTO(Integer id, String evaluations, String organization, String date) {
        this.id = id;
        this.evaluations = evaluations;
        this.organization = organization;
        this.date = date;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEvaluations() {
        return evaluations;
    }

    public void setEvaluations(String evaluations) {
        this.evaluations = evaluations;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public static EvaluationRecord getEvaluationRecord(EvaluationRecordDTO dto) {
        Gson gson = new Gson();

        List<Evaluation> list = gson.fromJson(dto.evaluations, new TypeToken<List<Evaluation>>() {
        }.getType());
        EvaluationRecord record = new EvaluationRecord(dto.id, list, dto.organization, dto.date);
        return record;
    }

    public static List<EvaluationRecord> getEvaluationRecords(List<EvaluationRecordDTO> dtos) {
        List<EvaluationRecord> records = new ArrayList<>();
        for (EvaluationRecordDTO dto : dtos) {
            EvaluationRecord record = getEvaluationRecord(dto);
            records.add(record);
        }
        return records;
    }
}
```
