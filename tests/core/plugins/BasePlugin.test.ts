import {
  AggregateQuery,
  Condition,
  SortOrder,
} from "@datamint/core/plugins/types";
import { TestPlugin } from "../../TestPlugin";

describe("BasePlugin", () => {
  let plugin: TestPlugin;

  beforeEach(() => {
    plugin = new TestPlugin();
  });

  describe("translateAggregateQuery", () => {
    it("should translate a simple aggregate query", () => {
      const query: AggregateQuery = [
        {
          $match: {
            field1: "value1",
            field2: "value2",
          },
        },
      ];

      const result = plugin.translateAggregateQueryExposed("table1", query);

      expect(result).toBe(
        "SELECT * FROM `table1` WHERE `field1` = 'value1' AND `field2` = 'value2'"
      );
    });

    it("translates a group stage in an aggregate query", () => {
      const query = [{ $group: { field1: "field1", field2: "field2" } }];
      const sql = plugin.translateAggregateQueryExposed("table", query);
      expect(sql).toContain(
        "SELECT `field1`, `field2` FROM `table` GROUP BY `field1`, `field2`"
      );
    });

    it("translate a match stage and a group stage in an aggregate query", () => {
      const query: AggregateQuery = [
        { $match: { field1: "value1", field2: "value2" } },
        { $group: { field1: "field1", field2: "field2" } },
      ];
      const sql = plugin.translateAggregateQueryExposed("table", query);
      expect(sql).toContain(
        "SELECT `field1`, `field2` FROM `table` WHERE `field1` = 'value1' AND `field2` = 'value2' GROUP BY `field1`, `field2`"
      );
    });

    it("properly translates a very complex aggregate query", () => {
      const query: AggregateQuery = [
        { $match: { field1: "value1", field2: "value2" } },
        { $group: { field1: "field1", field2: "field2" } },
        { $match: { field3: "value3", field4: "value4" } },
      ];
      const sql = plugin.translateAggregateQueryExposed("table", query);
      expect(sql).toContain(
        "SELECT `field1`, `field2` FROM `table` WHERE `field3` = 'value3' AND `field4` = 'value4' GROUP BY `field1`, `field2`"
      );
    });
  });

  describe("translateMatchStage", () => {
    it("should translate a simple match stage", () => {
      const match: { [key: string]: string | number | Condition } = {
        field1: "value1",
        field2: "value2",
      };

      const result = plugin.translateMatchStageExposed(match);

      expect(result).toBe("`field1` = 'value1' AND `field2` = 'value2'");
    });

    it("translates a sort stage in an aggregate query", () => {
      const query: AggregateQuery = [
        { $sort: { field1: SortOrder.ASC, field2: SortOrder.DESC } },
      ];
      const sql = plugin.translateAggregateQueryExposed("table", query);
      expect(sql).toContain(
        "SELECT * FROM `table` ORDER BY `field1` ASC, `field2` DESC"
      );
    });

    it("translates a complex aggregate query with match, group, and sort stages", () => {
      const query: AggregateQuery = [
        { $match: { field1: "value1", field2: "value2" } },
        { $group: { field1: "field1", field2: "field2" } },
        { $sort: { field1: SortOrder.ASC, field2: SortOrder.DESC } },
      ];
      const sql = plugin.translateAggregateQueryExposed("table", query);
      expect(sql).toContain(
        "SELECT `field1`, `field2` FROM `table` WHERE `field1` = 'value1' AND `field2` = 'value2' GROUP BY `field1`, `field2` ORDER BY `field1` ASC, `field2` DESC"
      );
    });
  });

  describe("translateComplexCondition", () => {
    it("should translate a complex condition", () => {
      const condition: Condition = {
        $gt: 5,
        $lt: 10,
      };

      const result = plugin.translateComplexConditionExposed(
        "field1",
        condition
      );

      expect(result).toBe("`field1` > '5' AND `field1` < '10'");
    });

    describe("translateComplexCondition", () => {
      it("should translate a $eq condition", () => {
        const condition: Condition = {
          $eq: "value",
        };

        const result = plugin.translateComplexConditionExposed(
          "field1",
          condition
        );

        expect(result).toBe("`field1` = 'value'");
      });

      it("should translate a $gt condition", () => {
        const condition: Condition = {
          $gt: 5,
        };

        const result = plugin.translateComplexConditionExposed(
          "field1",
          condition
        );

        expect(result).toBe("`field1` > '5'");
      });

      it("should translate a $lt condition", () => {
        const condition: Condition = {
          $lt: 10,
        };

        const result = plugin.translateComplexConditionExposed(
          "field1",
          condition
        );

        expect(result).toBe("`field1` < '10'");
      });

      it("should translate a $gte condition", () => {
        const condition: Condition = {
          $gte: 5,
        };

        const result = plugin.translateComplexConditionExposed(
          "field1",
          condition
        );

        expect(result).toBe("`field1` >= '5'");
      });

      it("should translate a $lte condition", () => {
        const condition: Condition = {
          $lte: 10,
        };

        const result = plugin.translateComplexConditionExposed(
          "field1",
          condition
        );

        expect(result).toBe("`field1` <= '10'");
      });
    });
  });
});
